import { db } from "@/db/drizzle";
import { accounts, insertNetWorthSnapshotSchema, netWorthSnapshots, transactions } from "@/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { createId } from "@paralleldrive/cuid2";
import { and, eq, desc, sum, sql } from "drizzle-orm";
import { Hono } from "hono";
import { startOfMonth, isSameMonth } from "date-fns";

const app = new Hono()
    // GET /net-worth — history of snapshots
    .get(
        "/",
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);

            if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);

            const data = await db
                .select()
                .from(netWorthSnapshots)
                .where(eq(netWorthSnapshots.userId, auth.userId))
                .orderBy(desc(netWorthSnapshots.snapshotDate));

            return c.json({ data });
        }
    )
    // POST /net-worth/snapshot — create a snapshot of current net worth
    .post(
        "/snapshot",
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);

            if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);

            // Get all accounts for this user
            const userAccounts = await db
                .select({
                    id: accounts.id,
                    type: accounts.type,
                    balance: accounts.balance,
                    creditLimit: accounts.creditLimit,
                })
                .from(accounts)
                .where(eq(accounts.userId, auth.userId));

            // Compute assets and liabilities
            // Assets: bank + investment accounts with positive balance
            // Liabilities: credit accounts (outstanding balance)
            let totalAssets = 0;
            let totalLiabilities = 0;

            for (const account of userAccounts) {
                const balance = account.balance ?? 0;
                if (account.type === "credit") {
                    // For credit accounts, positive balance means debt (liability)
                    totalLiabilities += Math.max(0, balance);
                } else {
                    // For bank/investment accounts, positive balance is an asset
                    totalAssets += Math.max(0, balance);
                }
            }

            const netWorth = totalAssets - totalLiabilities;
            const snapshotDate = startOfMonth(new Date());

            // Check if a snapshot already exists this month
            const existing = await db
                .select({ id: netWorthSnapshots.id })
                .from(netWorthSnapshots)
                .where(
                    and(
                        eq(netWorthSnapshots.userId, auth.userId),
                        eq(netWorthSnapshots.snapshotDate, snapshotDate),
                    )
                );

            if (existing.length > 0) {
                // Update existing snapshot
                const [data] = await db
                    .update(netWorthSnapshots)
                    .set({ totalAssets, totalLiabilities, netWorth })
                    .where(
                        and(
                            eq(netWorthSnapshots.userId, auth.userId),
                            eq(netWorthSnapshots.snapshotDate, snapshotDate),
                        )
                    )
                    .returning();
                return c.json({ data });
            }

            const [data] = await db
                .insert(netWorthSnapshots)
                .values({
                    id: createId(),
                    userId: auth.userId,
                    totalAssets,
                    totalLiabilities,
                    netWorth,
                    snapshotDate,
                })
                .returning();

            return c.json({ data });
        }
    );

export default app;
