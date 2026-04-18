import { db } from "@/db/drizzle";
import { transactions, insertTransactionSchema, categories, accounts } from "@/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { createId } from "@paralleldrive/cuid2";
import { zValidator } from "@hono/zod-validator";
import { and, asc, count, desc, eq, gte, ilike, inArray, lte, sql, SQL } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { parse, subDays } from "date-fns";

const app = new Hono()
    .get("/",
        zValidator("query", z.object({
            from: z.string().optional(),
            to: z.string().optional(),
            accountId: z.string().optional(),
            categoryId: z.string().optional(),
            type: z.enum(["income", "expense", "transfer"]).optional(),
            search: z.string().optional(),
            page: z.string().optional(),
            pageSize: z.string().optional(),
            sortBy: z.string().optional(),
            sortDir: z.enum(["asc", "desc"]).optional(),
        })),
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);
            if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);

            const { from, to, accountId, categoryId, type, search, page, pageSize, sortBy, sortDir } = c.req.valid("query");

            const pageNum = Math.max(1, parseInt(page ?? "1", 10));
            const pageSizeNum = Math.min(100, Math.max(1, parseInt(pageSize ?? "50", 10)));
            const offset = (pageNum - 1) * pageSizeNum;

            const conditions: SQL[] = [eq(accounts.userId, auth.userId)];

            if (from || to) {
                const defaultTo = new Date();
                const defaultFrom = subDays(defaultTo, 30);
                const startDate = from ? parse(from, "yyyy-MM-dd", new Date()) : defaultFrom;
                const endDate = to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo;
                conditions.push(gte(transactions.date, startDate));
                conditions.push(lte(transactions.date, endDate));
            }
            if (accountId) conditions.push(eq(transactions.accountId, accountId));
            if (categoryId) conditions.push(eq(transactions.categoryId, categoryId));
            if (type) conditions.push(eq(transactions.type, type));
            if (search) conditions.push(ilike(transactions.description, `%${search}%`));

            const where = and(...conditions);

            const orderCol = (() => {
                const dir = sortDir === "asc" ? asc : desc;
                switch (sortBy) {
                    case "amount": return dir(transactions.amount);
                    case "category": return dir(categories.name);
                    case "account": return dir(accounts.name);
                    case "type": return dir(transactions.type);
                    default: return dir(transactions.date);
                }
            })();

            const [data, [{ total }]] = await Promise.all([
                db
                    .select({
                        id: transactions.id,
                        date: transactions.date,
                        type: transactions.type,
                        description: transactions.description,
                        amount: transactions.amount,
                        transferFee: transactions.transferFee,
                        notes: transactions.notes,
                        account: accounts.name,
                        accountId: transactions.accountId,
                        toAccountId: transactions.toAccountId,
                        category: categories.name,
                        categoryId: transactions.categoryId,
                    })
                    .from(transactions)
                    .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                    .leftJoin(categories, eq(transactions.categoryId, categories.id))
                    .where(where)
                    .orderBy(orderCol)
                    .limit(pageSizeNum)
                    .offset(offset),
                db
                    .select({ total: count() })
                    .from(transactions)
                    .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                    .where(where),
            ]);

            return c.json({ data, total: Number(total), page: pageNum, pageSize: pageSizeNum });
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
                    id: transactions.id,
                    date: transactions.date,
                    type: transactions.type,
                    description: transactions.description,
                    amount: transactions.amount,
                    transferFee: transactions.transferFee,
                    notes: transactions.notes,
                    accountId: transactions.accountId,
                    toAccountId: transactions.toAccountId,
                    categoryId: transactions.categoryId,
                })
                .from(transactions)
                .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                .where(and(eq(transactions.id, id), eq(accounts.userId, auth.userId)));

            if (!data) return c.json({ error: "Not found" }, 404);

            return c.json({ data });
        }
    )
    .post("/",
        clerkMiddleware(),
        zValidator("json", insertTransactionSchema.omit({ id: true })),
        async (c) => {
            const auth = getAuth(c);
            const values = c.req.valid("json");

            if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);

            const [data] = await db.insert(transactions).values({
                id: createId(),
                ...values,
            }).returning();

            return c.json({ data });
        }
    )
    .post(
        "/bulk-create",
        clerkMiddleware(),
        zValidator("json", z.array(insertTransactionSchema.omit({ id: true }))),
        async (c) => {
            const auth = getAuth(c);
            const values = c.req.valid("json");

            if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);

            const data = await db.insert(transactions).values(
                values.map((value) => ({ id: createId(), ...value }))
            ).returning();

            return c.json({ data });
        }
    )
    .post(
        "/bulk-delete",
        clerkMiddleware(),
        zValidator("json", z.object({ ids: z.array(z.string()) })),
        async (c) => {
            const auth = getAuth(c);
            const values = c.req.valid("json");

            if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);

            const transactionsToDelete = db.$with("transactions_to_delete").as(
                db.select({ id: transactions.id })
                    .from(transactions)
                    .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                    .where(and(inArray(transactions.id, values.ids), eq(accounts.userId, auth.userId)))
            );

            const data = await db
                .with(transactionsToDelete)
                .delete(transactions)
                .where(inArray(transactions.id, sql`(SELECT id from ${transactionsToDelete})`))
                .returning({ id: transactions.id });

            return c.json(data);
        }
    )
    .patch(
        "/:id",
        clerkMiddleware(),
        zValidator("param", z.object({ id: z.string().optional() })),
        zValidator("json", insertTransactionSchema.omit({ id: true })),
        async (c) => {
            const auth = getAuth(c);
            const { id } = c.req.valid("param");
            const values = c.req.valid("json");

            if (!id) return c.json({ error: "Missing id" }, 400);
            if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);

            const transactionsToUpdate = db.$with("transactions_to_update").as(
                db.select({ id: transactions.id })
                    .from(transactions)
                    .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                    .where(and(eq(transactions.id, id), eq(accounts.userId, auth.userId)))
            );

            const [data] = await db
                .with(transactionsToUpdate)
                .update(transactions)
                .set(values)
                .where(inArray(transactions.id, sql`(SELECT id from ${transactionsToUpdate})`))
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

            const transactionsToDelete = db.$with("transactions_to_delete").as(
                db.select({ id: transactions.id })
                    .from(transactions)
                    .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                    .where(and(eq(transactions.id, id), eq(accounts.userId, auth.userId)))
            );

            const [data] = await db
                .with(transactionsToDelete)
                .delete(transactions)
                .where(inArray(transactions.id, sql`(SELECT id from ${transactionsToDelete})`))
                .returning({ id: transactions.id });

            if (!data) return c.json({ error: "Not found" }, 404);

            return c.json({ data });
        }
    )

export default app;
