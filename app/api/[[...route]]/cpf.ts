import { db } from "@/db/drizzle";
import { cpfAccounts, cpfContributions, insertCpfContributionSchema, userProfile } from "@/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { and, eq, desc } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { computeCPFContribution } from "@/lib/sg-cpf";
import { startOfMonth, format } from "date-fns";

const app = new Hono()
    // GET /cpf — returns CPF account balances
    .get(
        "/",
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);

            if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);

            const [account] = await db
                .select()
                .from(cpfAccounts)
                .where(eq(cpfAccounts.userId, auth.userId));

            return c.json({ data: account ?? null });
        }
    )
    // GET /cpf/contributions — contributions history
    .get(
        "/contributions",
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);

            if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);

            const data = await db
                .select()
                .from(cpfContributions)
                .where(eq(cpfContributions.userId, auth.userId))
                .orderBy(desc(cpfContributions.month));

            return c.json({ data });
        }
    )
    // POST /cpf/generate — auto-generate contribution for current month from profile
    .post(
        "/generate",
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);

            if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);

            const [profile] = await db
                .select()
                .from(userProfile)
                .where(eq(userProfile.userId, auth.userId));

            if (!profile) {
                return c.json({ error: "Profile not set up" }, 400);
            }

            if (!profile.age) {
                return c.json({ error: "Age not set in profile" }, 400);
            }

            const thisMonth = startOfMonth(new Date());

            // Check if contribution already exists for this month
            const [existing] = await db
                .select({ id: cpfContributions.id })
                .from(cpfContributions)
                .where(
                    and(
                        eq(cpfContributions.userId, auth.userId),
                        eq(cpfContributions.month, thisMonth),
                    )
                );

            if (existing) {
                return c.json({ error: "Contribution already generated for this month" }, 409);
            }

            const grossSalary = profile.monthlyIncome; // milliunits
            const contribution = computeCPFContribution(grossSalary, profile.age);

            const [contrib] = await db
                .insert(cpfContributions)
                .values({
                    id: createId(),
                    userId: auth.userId,
                    month: thisMonth,
                    grossSalary,
                    employeeContribution: contribution.employeeContribution,
                    employerContribution: contribution.employerContribution,
                    oaAmount: contribution.oa,
                    saAmount: contribution.sa,
                    maAmount: contribution.ma,
                    raAmount: contribution.ra,
                })
                .returning();

            // Update CPF account balances
            const [existingAccount] = await db
                .select()
                .from(cpfAccounts)
                .where(eq(cpfAccounts.userId, auth.userId));

            if (existingAccount) {
                await db
                    .update(cpfAccounts)
                    .set({
                        oaBalance: existingAccount.oaBalance + contribution.oa,
                        saBalance: existingAccount.saBalance + contribution.sa,
                        maBalance: existingAccount.maBalance + contribution.ma,
                        raBalance: existingAccount.raBalance + contribution.ra,
                        updatedAt: new Date(),
                    })
                    .where(eq(cpfAccounts.userId, auth.userId));
            } else {
                await db
                    .insert(cpfAccounts)
                    .values({
                        id: createId(),
                        userId: auth.userId,
                        oaBalance: contribution.oa,
                        saBalance: contribution.sa,
                        maBalance: contribution.ma,
                        raBalance: contribution.ra,
                    });
            }

            return c.json({ data: contrib });
        }
    )
    // PATCH /cpf — manually update CPF balances (for reconciliation)
    .patch(
        "/",
        clerkMiddleware(),
        zValidator("json", z.object({
            oaBalance: z.number().int(),
            saBalance: z.number().int(),
            maBalance: z.number().int(),
            raBalance: z.number().int().optional(),
        })),
        async (c) => {
            const auth = getAuth(c);
            const values = c.req.valid("json");

            if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);

            const [existing] = await db
                .select({ id: cpfAccounts.id })
                .from(cpfAccounts)
                .where(eq(cpfAccounts.userId, auth.userId));

            let data;

            if (existing) {
                [data] = await db
                    .update(cpfAccounts)
                    .set({ ...values, updatedAt: new Date() })
                    .where(eq(cpfAccounts.userId, auth.userId))
                    .returning();
            } else {
                [data] = await db
                    .insert(cpfAccounts)
                    .values({ id: createId(), userId: auth.userId, ...values })
                    .returning();
            }

            return c.json({ data });
        }
    );

export default app;
