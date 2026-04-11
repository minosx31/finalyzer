/**
 * Singapore Personal Income Tax — FY2025 (Year of Assessment 2026)
 * Source: https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-residency-and-tax-rates/individual-income-tax-rates
 *
 * All amounts in SGD (not milliunits — tax calculator works in whole dollars).
 */

// ─── Tax Brackets ─────────────────────────────────────────────────────────────

interface TaxBracket {
    from: number;   // chargeable income from (inclusive)
    to: number;     // chargeable income to (inclusive), Infinity for last bracket
    flatTax: number; // cumulative tax on income up to `from`
    rate: number;   // marginal rate as decimal
}

export const TAX_BRACKETS: TaxBracket[] = [
    { from: 0,       to: 20_000,  flatTax: 0,      rate: 0     },
    { from: 20_001,  to: 30_000,  flatTax: 0,      rate: 0.02  },
    { from: 30_001,  to: 40_000,  flatTax: 200,    rate: 0.035 },
    { from: 40_001,  to: 80_000,  flatTax: 550,    rate: 0.07  },
    { from: 80_001,  to: 120_000, flatTax: 3_350,  rate: 0.115 },
    { from: 120_001, to: 160_000, flatTax: 7_950,  rate: 0.15  },
    { from: 160_001, to: 200_000, flatTax: 13_950, rate: 0.18  },
    { from: 200_001, to: 240_000, flatTax: 21_150, rate: 0.19  },
    { from: 240_001, to: 280_000, flatTax: 28_750, rate: 0.195 },
    { from: 280_001, to: 320_000, flatTax: 36_550, rate: 0.20  },
    { from: 320_001, to: Infinity,flatTax: 44_550, rate: 0.22  },
];

// ─── Earned Income Relief (EIR) ───────────────────────────────────────────────
// Source: IRAS — auto-applied based on age

export function getEarnedIncomeRelief(age: number, hasDisability: boolean = false): number {
    if (hasDisability) {
        if (age < 55)  return 4_000;
        if (age < 60)  return 10_000;
        return 12_000;
    }
    if (age < 55)  return 1_000;
    if (age < 60)  return 6_000;
    return 8_000;
}

// ─── Relief Definitions ───────────────────────────────────────────────────────

export interface TaxReliefs {
    /** CPF Cash Top-Up Relief (self) — max $8,000 */
    cpfCashTopUpSelf?: number;
    /** CPF Cash Top-Up Relief (family) — max $8,000 */
    cpfCashTopUpFamily?: number;
    /** NSman Relief — $1,500 (active NSman), $3,000 (key appointment), $5,000 (Operationally Ready) */
    nsmanRelief?: number;
    /** Parent/Grandparent Relief — $5,500 (not staying together) or $9,000 (staying together) per parent */
    parentRelief?: number;
    /** Course Fees Relief — max $5,500 */
    courseFeesRelief?: number;
    /** SRS Relief — max $15,300 for citizens/PR, $35,700 for foreigners */
    srsRelief?: number;
    /** Any other reliefs (manual entry) */
    otherReliefs?: number;
}

export const RELIEF_CAPS = {
    cpfCashTopUpSelf: 8_000,
    cpfCashTopUpFamily: 8_000,
    nsmanRelief: 5_000,
    parentRelief: 9_000,    // per parent; cap is applied per parent by caller
    courseFeesRelief: 5_500,
    srsReliefCitizenPR: 15_300,
    srsReliefForeigner: 35_700,
} as const;

// ─── Core Tax Functions ───────────────────────────────────────────────────────

/**
 * Compute total personal reliefs.
 * @param age Taxpayer's age
 * @param reliefs Claimed reliefs object
 */
export function computeReliefsTotal(age: number, reliefs: TaxReliefs): number {
    const eir = getEarnedIncomeRelief(age);
    const cpfSelf = Math.min(reliefs.cpfCashTopUpSelf ?? 0, RELIEF_CAPS.cpfCashTopUpSelf);
    const cpfFamily = Math.min(reliefs.cpfCashTopUpFamily ?? 0, RELIEF_CAPS.cpfCashTopUpFamily);
    const nsman = Math.min(reliefs.nsmanRelief ?? 0, RELIEF_CAPS.nsmanRelief);
    const parent = reliefs.parentRelief ?? 0; // caller applies per-parent cap
    const course = Math.min(reliefs.courseFeesRelief ?? 0, RELIEF_CAPS.courseFeesRelief);
    const srs = reliefs.srsRelief ?? 0;
    const other = reliefs.otherReliefs ?? 0;

    return eir + cpfSelf + cpfFamily + nsman + parent + course + srs + other;
}

/**
 * Compute chargeable income = annual income - total reliefs (minimum 0).
 */
export function computeChargeableIncome(annualIncome: number, totalReliefs: number): number {
    return Math.max(0, annualIncome - totalReliefs);
}

/**
 * Compute income tax based on chargeable income using FY2025 progressive brackets.
 * @param chargeableIncome SGD (whole dollars)
 * @returns Tax payable in SGD
 */
export function computeTax(chargeableIncome: number): number {
    if (chargeableIncome <= 0) return 0;

    const bracket = TAX_BRACKETS.findLast((b) => chargeableIncome >= b.from)!;
    const marginalIncome = chargeableIncome - bracket.from + 1;
    return bracket.flatTax + marginalIncome * bracket.rate;
}

/**
 * Get a breakdown of tax by bracket for display purposes.
 */
export interface TaxBracketBreakdown {
    range: string;
    rate: string;
    taxable: number;
    tax: number;
}

export function computeTaxBreakdown(chargeableIncome: number): TaxBracketBreakdown[] {
    if (chargeableIncome <= 0) return [];

    return TAX_BRACKETS.filter((b) => chargeableIncome >= b.from && b.rate > 0).map((b) => {
        const taxableInBracket = Math.min(chargeableIncome, b.to === Infinity ? chargeableIncome : b.to) - b.from + 1;
        const clampedTaxable = Math.max(0, taxableInBracket);
        return {
            range: b.to === Infinity
                ? `Above $${(b.from - 1).toLocaleString()}`
                : `$${b.from.toLocaleString()} – $${b.to.toLocaleString()}`,
            rate: `${(b.rate * 100).toFixed(1)}%`,
            taxable: clampedTaxable,
            tax: clampedTaxable * b.rate,
        };
    });
}

/**
 * Compute expected monthly savings after tax and CPF employee contribution.
 * @param monthlyIncomeMilliunits Monthly income in milliunits
 * @param annualTax Annual tax in SGD
 * @param expectedSavingsRate Expected savings rate as a percentage (e.g. 20 = 20%)
 * @returns Expected monthly savings in milliunits
 */
export function computeExpectedMonthlySavings(
    monthlyIncomeMilliunits: number,
    annualTax: number,
    expectedSavingsRate: number
): number {
    const monthlyTaxMilliunits = Math.round((annualTax / 12) * 1000);
    const afterTaxIncome = monthlyIncomeMilliunits - monthlyTaxMilliunits;
    return Math.round(afterTaxIncome * (expectedSavingsRate / 100));
}
