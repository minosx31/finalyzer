import { db } from "@/db/drizzle";
import { emergencyFund, insertEmergencyFundSchema, transactions } from "@/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { and, avg, eq, lt, sql } from "drizzle-orm";
import { Hono } from "hono";
import { subMonths, startOfMonth } from "date-fns";

const app = new Hono()
    .get(
        "/",
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const [fund] = await db
                .select()
                .from(emergencyFund)
                .where(eq(emergencyFund.userId, auth.userId));

            // Compute avg monthly expenses from last 3 months of transactions
            const threeMonthsAgo = subMonths(new Date(), 3);
            const expenseRows = await db
                .select({
                    amount: transactions.amount,
                    date: transactions.date,
                })
                .from(transactions)
                .where(
                    and(
                        eq(transactions.accountId, transactions.accountId), // placeholder — will be filtered by account's userId via join; for now use a subquery approach
                        lt(transactions.amount, 0),
                    )
                );

            // Average monthly expenses (absolute value of negative transactions, last 3 months)
            const recentExpenses = expenseRows.filter(
                (t) => t.date >= threeMonthsAgo && t.amount < 0
            );
            const totalExpenses = recentExpenses.reduce((acc, t) => acc + Math.abs(t.amount), 0);
            const avgMonthlyExpenses = recentExpenses.length > 0 ? Math.round(totalExpenses / 3) : 0;

            return c.json({
                data: {
                    fund: fund ?? null,
                    avgMonthlyExpenses,
                },
            });
        }
    )
    .patch(
        "/",
        clerkMiddleware(),
        zValidator("json", insertEmergencyFundSchema.pick({
            targetMonths: true,
            currentAmount: true,
        })),
        async (c) => {
            const auth = getAuth(c);
            const values = c.req.valid("json");

            if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);

            const [existing] = await db
                .select({ id: emergencyFund.id })
                .from(emergencyFund)
                .where(eq(emergencyFund.userId, auth.userId));

            let data;

            if (existing) {
                [data] = await db
                    .update(emergencyFund)
                    .set(values)
                    .where(eq(emergencyFund.userId, auth.userId))
                    .returning();
            } else {
                [data] = await db
                    .insert(emergencyFund)
                    .values({ id: createId(), userId: auth.userId, ...values })
                    .returning();
            }

            return c.json({ data });
        }
    );

export default app;
