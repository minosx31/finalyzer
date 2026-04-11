/**
 * Singapore CPF Contribution Rates — Effective 1 January 2026
 * Source: https://www.cpf.gov.sg/employer/employer-obligations/how-much-cpf-contributions-to-pay
 * Source: https://www.cpf.gov.sg/service/article/what-are-the-cpf-allocation-rates
 *
 * Applies to Singapore Citizens and Permanent Residents (from 3rd year onwards).
 * Ordinary Wage (OW) Ceiling: SGD 8,000 / month
 * Annual CPF Salary Ceiling:  SGD 102,000 / year
 */

// ─── Contribution Rates by Age ───────────────────────────────────────────────

interface ContributionRate {
    employeeRate: number; // as decimal (e.g. 0.20)
    employerRate: number; // as decimal (e.g. 0.17)
}

const CONTRIBUTION_RATES: Array<{ maxAge: number } & ContributionRate> = [
    { maxAge: 55,  employeeRate: 0.20,  employerRate: 0.17  },
    { maxAge: 60,  employeeRate: 0.18,  employerRate: 0.16  },
    { maxAge: 65,  employeeRate: 0.125, employerRate: 0.125 },
    { maxAge: 70,  employeeRate: 0.075, employerRate: 0.09  },
    { maxAge: 999, employeeRate: 0.05,  employerRate: 0.075 },
];

// ─── Allocation Rates by Age ─────────────────────────────────────────────────
// Expressed as fraction of total wages (not fraction of contributions)

interface AllocationRate {
    oa: number; // Ordinary Account
    sa: number; // Special Account (for age < 55)
    ma: number; // MediSave Account
    ra: number; // Retirement Account (for age 55+, replaces SA)
}

const ALLOCATION_RATES: Array<{ minAge: number; maxAge: number } & AllocationRate> = [
    { minAge: 0,  maxAge: 35, oa: 0.23,  sa: 0.06,   ma: 0.08,  ra: 0 },
    { minAge: 36, maxAge: 45, oa: 0.21,  sa: 0.07,   ma: 0.09,  ra: 0 },
    { minAge: 46, maxAge: 50, oa: 0.19,  sa: 0.08,   ma: 0.10,  ra: 0 },
    { minAge: 51, maxAge: 55, oa: 0.15,  sa: 0.115,  ma: 0.105, ra: 0 },
    { minAge: 56, maxAge: 60, oa: 0.12,  sa: 0,      ma: 0.105, ra: 0.115 },
    { minAge: 61, maxAge: 65, oa: 0.035, sa: 0,      ma: 0.105, ra: 0.11  },
    { minAge: 66, maxAge: 70, oa: 0.01,  sa: 0,      ma: 0.105, ra: 0.05  },
    { minAge: 71, maxAge: 999,oa: 0.01,  sa: 0,      ma: 0.105, ra: 0.01  },
];

// ─── Wage Ceilings ────────────────────────────────────────────────────────────

/** Ordinary Wage ceiling in milliunits (SGD 8,000 × 1000) */
export const OW_CEILING_MILLIUNITS = 8_000_000;

/** Annual CPF Salary Ceiling in milliunits (SGD 102,000 × 1000) */
export const ANNUAL_CEILING_MILLIUNITS = 102_000_000;

// ─── Helper Functions ─────────────────────────────────────────────────────────

function getContributionRate(age: number): ContributionRate {
    return CONTRIBUTION_RATES.find((r) => age <= r.maxAge)!;
}

function getAllocationRate(age: number): AllocationRate {
    return ALLOCATION_RATES.find((r) => age >= r.minAge && age <= r.maxAge)!;
}

// ─── Main Computation ─────────────────────────────────────────────────────────

export interface CPFContributionResult {
    employeeContribution: number; // milliunits
    employerContribution: number; // milliunits
    oa: number;                   // milliunits allocated to OA
    sa: number;                   // milliunits allocated to SA
    ma: number;                   // milliunits allocated to MA
    ra: number;                   // milliunits allocated to RA (age 55+)
    cappedSalary: number;         // milliunits (after OW ceiling)
}

/**
 * Compute CPF contributions for a given gross monthly salary and age.
 * @param grossSalaryMilliunits Monthly gross salary in milliunits
 * @param age Employee's age in years
 */
export function computeCPFContribution(
    grossSalaryMilliunits: number,
    age: number
): CPFContributionResult {
    // Cap at Ordinary Wage ceiling
    const cappedSalary = Math.min(grossSalaryMilliunits, OW_CEILING_MILLIUNITS);

    const { employeeRate, employerRate } = getContributionRate(age);
    const alloc = getAllocationRate(age);

    const employeeContribution = Math.floor(cappedSalary * employeeRate);
    const employerContribution = Math.floor(cappedSalary * employerRate);

    // Allocation is based on total wages (capped salary), not on contributions
    const oa = Math.floor(cappedSalary * alloc.oa);
    const sa = Math.floor(cappedSalary * alloc.sa);
    const ma = Math.floor(cappedSalary * alloc.ma);
    const ra = Math.floor(cappedSalary * alloc.ra);

    return {
        employeeContribution,
        employerContribution,
        oa,
        sa,
        ma,
        ra,
        cappedSalary,
    };
}

// ─── Projection ───────────────────────────────────────────────────────────────

export interface CPFBalances {
    oaBalance: number;
    saBalance: number;
    maBalance: number;
    raBalance: number;
}

export interface CPFProjectionResult {
    year: number;
    age: number;
    oaBalance: number;
    saBalance: number;
    maBalance: number;
    raBalance: number;
    totalBalance: number;
}

/**
 * Project CPF balances at retirement based on current balances and monthly income.
 * Uses simple interest accrual: OA 2.5% p.a., SA/RA 4% p.a., MA 4% p.a.
 * @param currentBalances Current CPF account balances in milliunits
 * @param monthlyIncomeMilliunits Monthly income in milliunits
 * @param currentAge Current age in years
 * @param retirementAge Target retirement age (default 65)
 */
export function projectCPFAtRetirement(
    currentBalances: CPFBalances,
    monthlyIncomeMilliunits: number,
    currentAge: number,
    retirementAge: number = 65
): CPFProjectionResult[] {
    const results: CPFProjectionResult[] = [];

    let { oaBalance, saBalance, maBalance, raBalance } = currentBalances;
    const yearsToRetirement = Math.max(0, retirementAge - currentAge);

    for (let y = 0; y <= yearsToRetirement; y++) {
        const age = currentAge + y;
        results.push({
            year: new Date().getFullYear() + y,
            age,
            oaBalance,
            saBalance,
            maBalance,
            raBalance,
            totalBalance: oaBalance + saBalance + maBalance + raBalance,
        });

        if (y < yearsToRetirement) {
            // Add 12 months of contributions
            for (let m = 0; m < 12; m++) {
                const contrib = computeCPFContribution(monthlyIncomeMilliunits, age);
                oaBalance += contrib.oa;
                saBalance += contrib.sa;
                maBalance += contrib.ma;
                raBalance += contrib.ra;
            }
            // Apply annual interest (simplified, applied once at year end)
            oaBalance = Math.floor(oaBalance * 1.025);
            saBalance = Math.floor(saBalance * 1.04);
            maBalance = Math.floor(maBalance * 1.04);
            raBalance = Math.floor(raBalance * 1.04);
        }
    }

    return results;
}
