/**
 * Financial Health Score computation.
 * Score: 0–100 based on 5 weighted factors.
 */

export interface HealthScoreInput {
    /** Monthly income in milliunits */
    monthlyIncome: number;
    /** Monthly expenses in milliunits (absolute value of negative transactions) */
    monthlyExpenses: number;
    /** Total credit limit across all credit accounts in milliunits */
    totalCreditLimit: number;
    /** Current credit card balances (outstanding) in milliunits */
    totalCreditBalance: number;
    /** Emergency fund current amount in milliunits */
    emergencyFundCurrent: number;
    /** Emergency fund target amount in milliunits (targetMonths × avgMonthlyExpenses) */
    emergencyFundTarget: number;
    /** Average goal completion percentage (0–100) */
    avgGoalCompletion: number;
    /** Monthly debt payments (minimum payments on loans/credit) in milliunits */
    monthlyDebtPayments: number;
}

export interface HealthScoreFactor {
    name: string;
    score: number;       // 0–100 for this factor
    weight: number;      // contribution weight
    contribution: number; // weighted contribution to final score
    status: "good" | "fair" | "poor";
    detail: string;
}

export interface HealthScoreResult {
    totalScore: number;
    grade: "A" | "B" | "C" | "D" | "F";
    label: string;
    factors: HealthScoreFactor[];
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function factorStatus(score: number): "good" | "fair" | "poor" {
    if (score >= 70) return "good";
    if (score >= 40) return "fair";
    return "poor";
}

function gradeFromScore(score: number): "A" | "B" | "C" | "D" | "F" {
    if (score >= 85) return "A";
    if (score >= 70) return "B";
    if (score >= 55) return "C";
    if (score >= 40) return "D";
    return "F";
}

function labelFromGrade(grade: string): string {
    switch (grade) {
        case "A": return "Excellent";
        case "B": return "Good";
        case "C": return "Fair";
        case "D": return "Needs Attention";
        default:  return "Critical";
    }
}

/**
 * Compute financial health score from summary data.
 */
export function computeHealthScore(input: HealthScoreInput): HealthScoreResult {
    const factors: HealthScoreFactor[] = [];

    // ── 1. Savings Rate (30%) ─────────────────────────────────────────────────
    // Good: ≥20%, Fair: 10–20%, Poor: <10%
    const savingsRate = input.monthlyIncome > 0
        ? (input.monthlyIncome - input.monthlyExpenses) / input.monthlyIncome
        : 0;
    const savingsScore = clamp(Math.round((savingsRate / 0.20) * 100), 0, 100);
    factors.push({
        name: "Savings Rate",
        score: savingsScore,
        weight: 0.30,
        contribution: savingsScore * 0.30,
        status: factorStatus(savingsScore),
        detail: `Saving ${(savingsRate * 100).toFixed(1)}% of income (target ≥20%)`,
    });

    // ── 2. Emergency Fund Coverage (25%) ──────────────────────────────────────
    // Good: ≥100% of target (6 months), Fair: 50–100%, Poor: <50%
    const efCoverage = input.emergencyFundTarget > 0
        ? input.emergencyFundCurrent / input.emergencyFundTarget
        : 0;
    const efScore = clamp(Math.round(efCoverage * 100), 0, 100);
    factors.push({
        name: "Emergency Fund",
        score: efScore,
        weight: 0.25,
        contribution: efScore * 0.25,
        status: factorStatus(efScore),
        detail: `${(efCoverage * 100).toFixed(0)}% of target emergency fund funded`,
    });

    // ── 3. Credit Utilization (20%) ───────────────────────────────────────────
    // Good: <30%, Fair: 30–60%, Poor: >60%
    const utilization = input.totalCreditLimit > 0
        ? input.totalCreditBalance / input.totalCreditLimit
        : 0;
    // Invert: lower utilization = higher score
    const utilizationScore = clamp(Math.round((1 - utilization / 0.60) * 100), 0, 100);
    factors.push({
        name: "Credit Utilization",
        score: utilizationScore,
        weight: 0.20,
        contribution: utilizationScore * 0.20,
        status: factorStatus(utilizationScore),
        detail: `${(utilization * 100).toFixed(0)}% credit utilized (target <30%)`,
    });

    // ── 4. Goal Progress (15%) ────────────────────────────────────────────────
    // Good: ≥50% avg, Fair: 25–50%, Poor: <25%
    const goalScore = clamp(Math.round((input.avgGoalCompletion / 50) * 100), 0, 100);
    factors.push({
        name: "Goal Progress",
        score: goalScore,
        weight: 0.15,
        contribution: goalScore * 0.15,
        status: factorStatus(goalScore),
        detail: `Average goal completion: ${input.avgGoalCompletion.toFixed(0)}%`,
    });

    // ── 5. Debt-to-Income Ratio (10%) ─────────────────────────────────────────
    // Good: <20%, Fair: 20–36%, Poor: >36% of monthly income
    const dti = input.monthlyIncome > 0
        ? input.monthlyDebtPayments / input.monthlyIncome
        : 0;
    const dtiScore = clamp(Math.round((1 - dti / 0.36) * 100), 0, 100);
    factors.push({
        name: "Debt-to-Income",
        score: dtiScore,
        weight: 0.10,
        contribution: dtiScore * 0.10,
        status: factorStatus(dtiScore),
        detail: `Debt payments are ${(dti * 100).toFixed(0)}% of income (target <36%)`,
    });

    const totalScore = Math.round(factors.reduce((acc, f) => acc + f.contribution, 0));
    const grade = gradeFromScore(totalScore);

    return {
        totalScore,
        grade,
        label: labelFromGrade(grade),
        factors,
    };
}
