import { db } from "@/db/drizzle";
import { budgets, categories, insertBudgetSchema, transactions } from "@/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { and, eq, inArray, sql, sum } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

const app = new Hono()
    .get(
        "/",
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const data = await db
                .select({
                    id: budgets.id,
                    categoryId: budgets.categoryId,
                    categoryName: categories.name,
                    amount: budgets.amount,
                    period: budgets.period,
                })
                .from(budgets)
                .leftJoin(categories, eq(budgets.categoryId, categories.id))
                .where(eq(budgets.userId, auth.userId));

            return c.json({ data });
        }
    )
    .get(
        "/:id",
        zValidator("param", z.object({ id: z.string().optional() })),
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);
            const { id } = c.req.valid("param");

            if (!id) return c.json({ error: "Missing id" }, 400);
            if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);

            const [data] = await db
                .select({
                    id: budgets.id,
                    categoryId: budgets.categoryId,
                    categoryName: categories.name,
                    amount: budgets.amount,
                    period: budgets.period,
                })
                .from(budgets)
                .leftJoin(categories, eq(budgets.categoryId, categories.id))
                .where(
                    and(
                        eq(budgets.userId, auth.userId),
                        eq(budgets.id, id),
                    ),
                );

            if (!data) return c.json({ error: "Not found" }, 404);
            return c.json({ data });
        }
    )
    .post(
        "/",
        clerkMiddleware(),
        zValidator("json", insertBudgetSchema.pick({
            categoryId: true,
            amount: true,
            period: true,
        })),
        async (c) => {
            const auth = getAuth(c);
            const values = c.req.valid("json");

            if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);

            const [data] = await db
                .insert(budgets)
                .values({ id: createId(), userId: auth.userId, ...values })
                .returning();

            return c.json({ data });
        }
    )
    .patch(
        "/:id",
        clerkMiddleware(),
        zValidator("param", z.object({ id: z.string().optional() })),
        zValidator("json", insertBudgetSchema.pick({
            categoryId: true,
            amount: true,
            period: true,
        })),
        async (c) => {
            const auth = getAuth(c);
            const { id } = c.req.valid("param");
            const values = c.req.valid("json");

            if (!id) return c.json({ error: "Missing id" }, 400);
            if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);

            const [data] = await db
                .update(budgets)
                .set(values)
                .where(and(eq(budgets.userId, auth.userId), eq(budgets.id, id)))
                .returning();

            if (!data) return c.json({ error: "Not found" }, 404);
            return c.json({ data });
        }
    )
    .delete(
        "/:id",
        clerkMiddleware(),
        zValidator("param", z.object({ id: z.string().optional() })),
        async (c) => {
            const auth = getAuth(c);
            const { id } = c.req.valid("param");

            if (!id) return c.json({ error: "Missing id" }, 400);
            if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);

            const [data] = await db
                .delete(budgets)
                .where(and(eq(budgets.userId, auth.userId), eq(budgets.id, id)))
                .returning({ id: budgets.id });

            if (!data) return c.json({ error: "Not found" }, 404);
            return c.json({ data });
        }
    )
    .post(
        "/bulk-delete",
        clerkMiddleware(),
        zValidator("json", z.object({ ids: z.array(z.string()) })),
        async (c) => {
            const auth = getAuth(c);
            const { ids } = c.req.valid("json");

            if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);

            const data = await db
                .delete(budgets)
                .where(and(eq(budgets.userId, auth.userId), inArray(budgets.id, ids)))
                .returning({ id: budgets.id });

            return c.json({ data });
        }
    );

export default app;
