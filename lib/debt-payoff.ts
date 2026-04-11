/**
 * Debt payoff calculators — Avalanche and Snowball methods.
 * All amounts in milliunits.
 */

export interface Debt {
    id: string;
    name: string;
    balance: number;        // milliunits (current outstanding)
    interestRate: number;   // basis points (1/100th of a percent), e.g. 2400 = 24%
    minPayment: number;     // milliunits per month (estimated as ~2% of balance or 0 if not tracked)
}

export interface PayoffMonth {
    month: number;
    remaining: number;       // milliunits
    interestPaid: number;    // milliunits
    principalPaid: number;   // milliunits
}

export interface DebtPayoffResult {
    id: string;
    name: string;
    months: number;           // total months to pay off
    totalInterest: number;    // milliunits
    schedule: PayoffMonth[];  // monthly schedule
}

export interface PayoffSummary {
    totalMonths: number;
    totalInterestPaid: number; // milliunits
    results: DebtPayoffResult[];
}

function annualBpsToMonthlyRate(bps: number): number {
    // Convert basis points (annual) to monthly decimal rate
    return bps / 10000 / 12;
}

/**
 * Simulate payoff of a single debt with a given monthly payment.
 */
function simulateSingleDebt(
    debt: Debt,
    monthlyPayment: number,
    maxMonths: number = 600
): DebtPayoffResult {
    const monthlyRate = annualBpsToMonthlyRate(debt.interestRate);
    let remaining = debt.balance;
    let totalInterest = 0;
    const schedule: PayoffMonth[] = [];

    for (let month = 1; month <= maxMonths && remaining > 0; month++) {
        const interest = Math.round(remaining * monthlyRate);
        const payment = Math.min(monthlyPayment, remaining + interest);
        const principal = payment - interest;

        remaining = Math.max(0, remaining - principal);
        totalInterest += interest;

        schedule.push({
            month,
            remaining,
            interestPaid: interest,
            principalPaid: principal,
        });
    }

    return {
        id: debt.id,
        name: debt.name,
        months: schedule.length,
        totalInterest,
        schedule,
    };
}

/**
 * Avalanche method: pay minimums on all debts, apply extra to highest-interest debt first.
 * Minimises total interest paid.
 */
export function computeAvalanche(debts: Debt[], totalMonthlyPayment: number): PayoffSummary {
    const sorted = [...debts].sort((a, b) => b.interestRate - a.interestRate);
    return runPayoffStrategy(sorted, totalMonthlyPayment);
}

/**
 * Snowball method: pay minimums on all debts, apply extra to smallest-balance debt first.
 * Builds psychological momentum.
 */
export function computeSnowball(debts: Debt[], totalMonthlyPayment: number): PayoffSummary {
    const sorted = [...debts].sort((a, b) => a.balance - b.balance);
    return runPayoffStrategy(sorted, totalMonthlyPayment);
}

function runPayoffStrategy(orderedDebts: Debt[], totalMonthlyPayment: number): PayoffSummary {
    const remaining = orderedDebts.map((d) => ({ ...d }));
    const results: Map<string, DebtPayoffResult> = new Map();
    let month = 0;
    const MAX_MONTHS = 600;

    while (remaining.some((d) => d.balance > 0) && month < MAX_MONTHS) {
        month++;
        let extra = totalMonthlyPayment;

        // Pay minimums first
        for (const debt of remaining) {
            if (debt.balance <= 0) continue;
            const rate = annualBpsToMonthlyRate(debt.interestRate);
            const interest = Math.round(debt.balance * rate);
            const minPay = Math.min(debt.minPayment || interest + 1, debt.balance + interest);
            const actualPay = Math.min(minPay, extra);
            const principal = actualPay - interest;
            debt.balance = Math.max(0, debt.balance - principal);
            extra -= actualPay;
        }

        // Apply extra to the target debt (first with balance remaining)
        for (const debt of remaining) {
            if (debt.balance <= 0 || extra <= 0) continue;
            const paid = Math.min(extra, debt.balance);
            debt.balance = Math.max(0, debt.balance - paid);
            extra -= paid;
            break;
        }
    }

    // Rebuild individual results using simple simulation for each debt
    for (const debt of orderedDebts) {
        const minPay = debt.minPayment || Math.round(debt.balance * 0.02);
        const result = simulateSingleDebt(debt, Math.max(minPay, totalMonthlyPayment / orderedDebts.length));
        results.set(debt.id, result);
    }

    const allResults = orderedDebts.map((d) => results.get(d.id)!);
    const totalMonths = Math.max(...allResults.map((r) => r.months));
    const totalInterestPaid = allResults.reduce((acc, r) => acc + r.totalInterest, 0);

    return { totalMonths, totalInterestPaid, results: allResults };
}
