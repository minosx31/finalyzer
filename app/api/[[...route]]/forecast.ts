import { db } from "@/db/drizzle";
import { recurringExpenses, transactions, accounts } from "@/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { and, eq, gte, lt, sql } from "drizzle-orm";
import { Hono } from "hono";
import { subMonths, startOfMonth, endOfMonth, addMonths, format } from "date-fns";
import { buildForecast } from "@/lib/forecast";

const app = new Hono()
    .get(
        "/",
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);

            if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);

            // Fetch recurring expenses
            const recurring = await db
                .select({
                    id: recurringExpenses.id,
                    name: recurringExpenses.name,
                    amount: recurringExpenses.amount,
                    frequency: recurringExpenses.frequency,
                })
                .from(recurringExpenses)
                .where(eq(recurringExpenses.userId, auth.userId));

            // Compute average monthly income from last 3 months of positive transactions
            const threeMonthsAgo = subMonths(new Date(), 3);
            const recentTransactions = await db
                .select({
                    amount: transactions.amount,
                    date: transactions.date,
                })
                .from(transactions)
                .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                .where(
                    and(
                        eq(accounts.userId, auth.userId),
                        gte(transactions.date, threeMonthsAgo),
                    )
                );

            const incomeTransactions = recentTransactions.filter((t) => t.amount > 0);
            const totalIncome = incomeTransactions.reduce((acc, t) => acc + t.amount, 0);
            const avgMonthlyIncome = incomeTransactions.length > 0
                ? Math.round(totalIncome / 3)
                : 0;

            const forecast = buildForecast(recurring, avgMonthlyIncome, 6);

            return c.json({ data: forecast });
        }
    );

export default app;
