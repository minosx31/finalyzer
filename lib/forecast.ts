import { addMonths, format, startOfMonth } from "date-fns";

interface RecurringExpense {
    id: string;
    name: string;
    amount: number;    // milliunits
    frequency: string; // "weekly" | "monthly" | "yearly"
}

export interface ForecastMonth {
    month: string;           // e.g. "May 2026"
    monthKey: string;        // e.g. "2026-05"
    projectedIncome: number; // milliunits
    projectedExpenses: number; // milliunits
    projectedBalance: number;  // milliunits (income - expenses)
    recurringItems: Array<{ name: string; amount: number }>;
}

/**
 * Convert a recurring expense amount to its monthly equivalent in milliunits.
 */
function toMonthlyAmount(amount: number, frequency: string): number {
    switch (frequency) {
        case "weekly":  return Math.round(amount * 52 / 12);
        case "monthly": return amount;
        case "yearly":  return Math.round(amount / 12);
        default:        return amount;
    }
}

/**
 * Build a 6-month cashflow forecast from recurring expenses and average monthly income.
 * @param recurring List of recurring expenses
 * @param avgMonthlyIncome Average monthly income in milliunits (from last 3 months of transactions)
 * @param months Number of months to forecast (default 6)
 */
export function buildForecast(
    recurring: RecurringExpense[],
    avgMonthlyIncome: number,
    months: number = 6
): ForecastMonth[] {
    const result: ForecastMonth[] = [];
    const now = new Date();

    for (let i = 1; i <= months; i++) {
        const monthDate = addMonths(startOfMonth(now), i);
        const monthKey = format(monthDate, "yyyy-MM");
        const monthLabel = format(monthDate, "MMM yyyy");

        const recurringItems = recurring.map((r) => ({
            name: r.name,
            amount: toMonthlyAmount(r.amount, r.frequency),
        }));

        const projectedExpenses = recurringItems.reduce((acc, r) => acc + r.amount, 0);

        result.push({
            month: monthLabel,
            monthKey,
            projectedIncome: avgMonthlyIncome,
            projectedExpenses,
            projectedBalance: avgMonthlyIncome - projectedExpenses,
            recurringItems,
        });
    }

    return result;
}
