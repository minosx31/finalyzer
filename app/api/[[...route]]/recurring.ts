import { db } from "@/db/drizzle";
import { recurringExpenses, insertRecurringExpenseSchema, categories } from "@/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { and, eq, inArray } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { processRecurringExpenses } from "@/lib/process-recurring";

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
                    id: recurringExpenses.id,
                    name: recurringExpenses.name,
                    amount: recurringExpenses.amount,
                    frequency: recurringExpenses.frequency,
                    startDate: recurringExpenses.startDate,
                    categoryId: recurringExpenses.categoryId,
                    categoryName: categories.name,
                })
                .from(recurringExpenses)
                .leftJoin(categories, eq(recurringExpenses.categoryId, categories.id))
                .where(eq(recurringExpenses.userId, auth.userId));

            return c.json({ data });
        }
    )
    .get(
        "/:id",
        zValidator("param", z.object({
            id: z.string().optional(),
        })),
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);
            const { id } = c.req.valid("param");

            if (!id) {
                return c.json({ error: "Missing id" }, 400);
            }

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const [data] = await db
                .select()
                .from(recurringExpenses)
                .where(
                    and(
                        eq(recurringExpenses.userId, auth.userId),
                        eq(recurringExpenses.id, id),
                    ),
                );

            if (!data) {
                return c.json({ error: "Not found" }, 404);
            }

            return c.json({ data });
        }
    )
    .post(
        "/",
        clerkMiddleware(),
        zValidator("json", insertRecurringExpenseSchema.pick({
            name: true,
            amount: true,
            frequency: true,
            startDate: true,
            accountId: true,
            categoryId: true,
        })),
        async (c) => {
            const auth = getAuth(c);
            const values = c.req.valid("json");

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const [data] = await db.insert(recurringExpenses).values({
                id: createId(),
                userId: auth.userId,
                ...values,
            }).returning();

            return c.json({ data });
        }
    )
    .patch(
        "/:id",
        clerkMiddleware(),
        zValidator(
            "param",
            z.object({
                id: z.string().optional(),
            })
        ),
        zValidator(
            "json",
            insertRecurringExpenseSchema.pick({
                name: true,
                amount: true,
                frequency: true,
                startDate: true,
                categoryId: true,
            })
        ),
        async (c) => {
            const auth = getAuth(c);
            const { id } = c.req.valid("param");
            const values = c.req.valid("json");

            if (!id) {
                return c.json({ error: "Missing id" }, 400);
            }

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const [data] = await db
                .update(recurringExpenses)
                .set(values)
                .where(
                    and(
                        eq(recurringExpenses.userId, auth.userId),
                        eq(recurringExpenses.id, id),
                    ),
                )
                .returning();

            if (!data) {
                return c.json({ error: "Not found" }, 404);
            }

            return c.json({ data });
        }
    )
    .delete(
        "/:id",
        clerkMiddleware(),
        zValidator(
            "param",
            z.object({
                id: z.string().optional(),
            })
        ),
        async (c) => {
            const auth = getAuth(c);
            const { id } = c.req.valid("param");

            if (!id) {
                return c.json({ error: "Missing id" }, 400);
            }

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const [data] = await db
                .delete(recurringExpenses)
                .where(
                    and(
                        eq(recurringExpenses.userId, auth.userId),
                        eq(recurringExpenses.id, id),
                    ),
                )
                .returning({
                    id: recurringExpenses.id,
                });

            if (!data) {
                return c.json({ error: "Not found" }, 404);
            }

            return c.json({ data });
        }
    )
    .post(
        "/process",
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);
            if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);

            const count = await processRecurringExpenses(auth.userId);
            return c.json({ generated: count });
        }
    );

export default app;
