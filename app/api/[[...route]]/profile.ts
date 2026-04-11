import { db } from "@/db/drizzle";
import { userProfile, insertUserProfileSchema } from "@/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

const app = new Hono()
    .get(
        "/",
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const [data] = await db
                .select()
                .from(userProfile)
                .where(eq(userProfile.userId, auth.userId));

            return c.json({ data: data ?? null });
        }
    )
    .patch(
        "/",
        clerkMiddleware(),
        zValidator("json", insertUserProfileSchema.pick({
            monthlyIncome: true,
            annualIncome: true,
            age: true,
            citizenshipStatus: true,
            expectedSavingsRate: true,
        })),
        async (c) => {
            const auth = getAuth(c);
            const values = c.req.valid("json");

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const [existing] = await db
                .select({ id: userProfile.id })
                .from(userProfile)
                .where(eq(userProfile.userId, auth.userId));

            let data;

            if (existing) {
                [data] = await db
                    .update(userProfile)
                    .set({ ...values, updatedAt: new Date() })
                    .where(eq(userProfile.userId, auth.userId))
                    .returning();
            } else {
                [data] = await db
                    .insert(userProfile)
                    .values({
                        id: createId(),
                        userId: auth.userId,
                        ...values,
                    })
                    .returning();
            }

            return c.json({ data });
        }
    )
    .patch(
        "/health-check",
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const [data] = await db
                .update(userProfile)
                .set({ lastHealthCheckAt: new Date(), updatedAt: new Date() })
                .where(eq(userProfile.userId, auth.userId))
                .returning();

            if (!data) {
                return c.json({ error: "Profile not found" }, 404);
            }

            return c.json({ data });
        }
    );

export default app;
