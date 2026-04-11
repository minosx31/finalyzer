import { db } from "@/db/drizzle";
import { dividends, insertDividendSchema, insertInvestmentSchema, investments } from "@/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { and, eq, inArray, desc } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

const app = new Hono()
    // ── Investments CRUD ──────────────────────────────────────────────────────
    .get(
        "/",
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);

            if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);

            const data = await db
                .select()
                .from(investments)
                .where(eq(investments.userId, auth.userId));

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
                .select()
                .from(investments)
                .where(and(eq(investments.userId, auth.userId), eq(investments.id, id)));

            if (!data) return c.json({ error: "Not found" }, 404);
            return c.json({ data });
        }
    )
    .post(
        "/",
        clerkMiddleware(),
        zValidator("json", insertInvestmentSchema.pick({
            ticker: true,
            name: true,
            type: true,
            exchange: true,
            shares: true,
            avgCostPrice: true,
            currentPrice: true,
            currency: true,
        })),
        async (c) => {
            const auth = getAuth(c);
            const values = c.req.valid("json");

            if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);

            const [data] = await db
                .insert(investments)
                .values({ id: createId(), userId: auth.userId, ...values })
                .returning();

            return c.json({ data });
        }
    )
    .patch(
        "/:id",
        clerkMiddleware(),
        zValidator("param", z.object({ id: z.string().optional() })),
        zValidator("json", insertInvestmentSchema.pick({
            ticker: true,
            name: true,
            type: true,
            exchange: true,
            shares: true,
            avgCostPrice: true,
            currentPrice: true,
            currency: true,
        })),
        async (c) => {
            const auth = getAuth(c);
            const { id } = c.req.valid("param");
            const values = c.req.valid("json");

            if (!id) return c.json({ error: "Missing id" }, 400);
            if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);

            const [data] = await db
                .update(investments)
                .set(values)
                .where(and(eq(investments.userId, auth.userId), eq(investments.id, id)))
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
                .delete(investments)
                .where(and(eq(investments.userId, auth.userId), eq(investments.id, id)))
                .returning({ id: investments.id });

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
                .delete(investments)
                .where(and(eq(investments.userId, auth.userId), inArray(investments.id, ids)))
                .returning({ id: investments.id });

            return c.json({ data });
        }
    )
    // ── Dividends ─────────────────────────────────────────────────────────────
    .get(
        "/dividends",
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);

            if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);

            const data = await db
                .select({
                    id: dividends.id,
                    investmentId: dividends.investmentId,
                    investmentName: investments.name,
                    ticker: investments.ticker,
                    amount: dividends.amount,
                    date: dividends.date,
                })
                .from(dividends)
                .leftJoin(investments, eq(dividends.investmentId, investments.id))
                .where(eq(dividends.userId, auth.userId))
                .orderBy(desc(dividends.date));

            return c.json({ data });
        }
    )
    .post(
        "/dividends",
        clerkMiddleware(),
        zValidator("json", insertDividendSchema.pick({
            investmentId: true,
            amount: true,
            date: true,
        })),
        async (c) => {
            const auth = getAuth(c);
            const values = c.req.valid("json");

            if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);

            const [data] = await db
                .insert(dividends)
                .values({ id: createId(), userId: auth.userId, ...values })
                .returning();

            return c.json({ data });
        }
    )
    .delete(
        "/dividends/:id",
        clerkMiddleware(),
        zValidator("param", z.object({ id: z.string().optional() })),
        async (c) => {
            const auth = getAuth(c);
            const { id } = c.req.valid("param");

            if (!id) return c.json({ error: "Missing id" }, 400);
            if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);

            const [data] = await db
                .delete(dividends)
                .where(and(eq(dividends.userId, auth.userId), eq(dividends.id, id)))
                .returning({ id: dividends.id });

            if (!data) return c.json({ error: "Not found" }, 404);
            return c.json({ data });
        }
    );

export default app;
