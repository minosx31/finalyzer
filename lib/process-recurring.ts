import { db } from "@/db/drizzle";
import { recurringExpenses, transactions } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { addWeeks, addMonths, addYears, isAfter, startOfDay } from "date-fns";

function getNextDate(date: Date, frequency: string): Date {
    switch (frequency) {
        case "weekly":  return addWeeks(date, 1);
        case "monthly": return addMonths(date, 1);
        case "yearly":  return addYears(date, 1);
        default:        return addMonths(date, 1);
    }
}

function getDueDates(frequency: string, from: Date, until: Date): Date[] {
    const dates: Date[] = [];
    let cursor = getNextDate(from, frequency);
    while (!isAfter(cursor, until)) {
        dates.push(cursor);
        cursor = getNextDate(cursor, frequency);
    }
    return dates;
}

export async function processRecurringExpenses(userId: string): Promise<number> {
    const templates = await db
        .select()
        .from(recurringExpenses)
        .where(eq(recurringExpenses.userId, userId));

    if (templates.length === 0) return 0;

    const today = startOfDay(new Date());
    const toInsert: (typeof transactions.$inferInsert)[] = [];
    const toUpdate: { id: string; lastGeneratedAt: Date }[] = [];

    for (const template of templates) {
        if (!template.accountId) continue;

        const from = template.lastGeneratedAt
            ? startOfDay(template.lastGeneratedAt)
            : startOfDay(template.startDate);

        // Don't generate if startDate is in the future
        if (isAfter(from, today)) continue;

        const dueDates = getDueDates(template.frequency, from, today);
        if (dueDates.length === 0) continue;

        for (const date of dueDates) {
            toInsert.push({
                id: createId(),
                type: "expense",
                amount: Math.abs(template.amount),
                description: template.name,
                date,
                accountId: template.accountId,
                categoryId: template.categoryId ?? null,
                recurringExpenseId: template.id,
                notes: null,
                toAccountId: null,
                transferFee: null,
            });
        }

        toUpdate.push({ id: template.id, lastGeneratedAt: today });
    }

    if (toInsert.length > 0) {
        await db.insert(transactions).values(toInsert);
    }

    for (const { id, lastGeneratedAt } of toUpdate) {
        await db
            .update(recurringExpenses)
            .set({ lastGeneratedAt })
            .where(and(eq(recurringExpenses.id, id), eq(recurringExpenses.userId, userId)));
    }

    return toInsert.length;
}
