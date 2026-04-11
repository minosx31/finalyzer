"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Loader2, Receipt, Info } from "lucide-react";
import CurrencyInput from "react-currency-input-field";

import { useGetProfile } from "@/features/profile/api/use-get-profile";
import {
    computeReliefsTotal,
    computeChargeableIncome,
    computeTax,
    computeTaxBreakdown,
    computeExpectedMonthlySavings,
    getEarnedIncomeRelief,
    RELIEF_CAPS,
    type TaxReliefs,
} from "@/lib/sg-tax";
import { convertAmountFromMiliUnits, formatSGD } from "@/lib/utils";

// ─── Form schema ──────────────────────────────────────────────────────────────

const formSchema = z.object({
    annualIncome: z.string().min(1, "Annual income is required"),
    age: z.string().min(1, "Age is required"),
    expectedSavingsRate: z.string(),
    cpfCashTopUpSelf: z.string(),
    cpfCashTopUpFamily: z.string(),
    nsmanRelief: z.string(),
    parentRelief: z.string(),
    courseFeesRelief: z.string(),
    srsRelief: z.string(),
    otherReliefs: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

const toNumber = (s: string) => parseFloat(s) || 0;

function parseReliefs(values: FormValues): TaxReliefs {
    return {
        cpfCashTopUpSelf: toNumber(values.cpfCashTopUpSelf),
        cpfCashTopUpFamily: toNumber(values.cpfCashTopUpFamily),
        nsmanRelief: toNumber(values.nsmanRelief),
        parentRelief: toNumber(values.parentRelief),
        courseFeesRelief: toNumber(values.courseFeesRelief),
        srsRelief: toNumber(values.srsRelief),
        otherReliefs: toNumber(values.otherReliefs),
    };
}

// ─── Result card ──────────────────────────────────────────────────────────────

function ResultCard({
    label,
    value,
    sub,
    highlight,
}: {
    label: string;
    value: string;
    sub?: string;
    highlight?: boolean;
}) {
    return (
        <Card className={`border ${highlight ? "border-blue-200 bg-blue-50/50" : "bg-muted/30"}`}>
            <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`text-xl font-bold mt-0.5 ${highlight ? "text-blue-700" : ""}`}>{value}</p>
                {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
            </CardContent>
        </Card>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const currencyInputClass =
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

const TaxCalculatorPage = () => {
    const profileQuery = useGetProfile();
    const profile = profileQuery.data;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            annualIncome: "",
            age: "30",
            expectedSavingsRate: "20",
            cpfCashTopUpSelf: "",
            cpfCashTopUpFamily: "",
            nsmanRelief: "",
            parentRelief: "",
            courseFeesRelief: "",
            srsRelief: "",
            otherReliefs: "",
        },
    });

    // Prefill from profile once loaded
    useEffect(() => {
        if (!profile) return;
        form.setValue("annualIncome", convertAmountFromMiliUnits(profile.annualIncome).toFixed(2));
        if (profile.age) form.setValue("age", profile.age.toString());
        if (profile.expectedSavingsRate) {
            form.setValue("expectedSavingsRate", profile.expectedSavingsRate.toString());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile]);

    // Reactive computation — watch all fields
    const values = useWatch({ control: form.control });

    const annualIncome = toNumber(values.annualIncome ?? "");
    const age = toNumber(values.age ?? "0");
    const expectedSavingsRate = toNumber(values.expectedSavingsRate ?? "20");

    const reliefs = parseReliefs(values as FormValues);
    const eir = age > 0 ? getEarnedIncomeRelief(age) : 0;
    const totalReliefs = age > 0 ? computeReliefsTotal(age, reliefs) : 0;
    const chargeableIncome = computeChargeableIncome(annualIncome, totalReliefs);
    const annualTax = computeTax(chargeableIncome);
    const effectiveRate = annualIncome > 0 ? (annualTax / annualIncome) * 100 : 0;
    const monthlyIncomeMilli = Math.round(annualIncome / 12 * 1000);
    const expectedMonthlySavings = computeExpectedMonthlySavings(
        monthlyIncomeMilli, annualTax, expectedSavingsRate
    );
    const bracketBreakdown = computeTaxBreakdown(chargeableIncome);

    if (profileQuery.isLoading) {
        return (
            <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
                <Card className="border-none drop-shadow-md">
                    <CardHeader>
                        <Skeleton className="h-8 w-48" />
                    </CardHeader>
                    <CardContent>
                        <div className="h-[500px] w-full flex items-center justify-center">
                            <Loader2 className="size-6 text-slate-300 animate-spin" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
            <Card className="border-none drop-shadow-md">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Receipt className="size-5 text-muted-foreground" />
                        <CardTitle className="text-xl">Income Tax Calculator</CardTitle>
                    </div>
                    <CardDescription>
                        Singapore personal income tax estimate — FY2025 / Year of Assessment 2026.
                        Figures are indicative and do not constitute tax advice.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* ── Left: Inputs ── */}
                        <div className="lg:col-span-2 space-y-5">
                            <Form {...form}>
                                <form className="space-y-4">
                                    {/* Income & basics */}
                                    <div>
                                        <p className="text-sm font-semibold mb-3">Income & Personal Details</p>
                                        <div className="space-y-3">
                                            <FormField
                                                name="annualIncome"
                                                control={form.control}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Annual Income (SGD)</FormLabel>
                                                        <FormControl>
                                                            <CurrencyInput
                                                                prefix="S$"
                                                                placeholder="0.00"
                                                                value={field.value}
                                                                decimalsLimit={2}
                                                                decimalScale={2}
                                                                onValueChange={field.onChange}
                                                                className={currencyInputClass}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="grid grid-cols-2 gap-3">
                                                <FormField
                                                    name="age"
                                                    control={form.control}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Age</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" min={16} max={99} placeholder="e.g. 30" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    name="expectedSavingsRate"
                                                    control={form.control}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Savings Rate (%)</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" min={0} max={100} placeholder="20" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Reliefs */}
                                    <div>
                                        <div className="flex items-center gap-1.5 mb-3">
                                            <p className="text-sm font-semibold">Tax Reliefs</p>
                                            <Badge variant="outline" className="text-xs text-emerald-700 border-emerald-200">
                                                EIR: {formatSGD(eir)} auto-applied
                                            </Badge>
                                        </div>
                                        <div className="space-y-3">
                                            {[
                                                { name: "cpfCashTopUpSelf" as const, label: `CPF Cash Top-Up (Self)`, cap: RELIEF_CAPS.cpfCashTopUpSelf },
                                                { name: "cpfCashTopUpFamily" as const, label: `CPF Cash Top-Up (Family)`, cap: RELIEF_CAPS.cpfCashTopUpFamily },
                                                { name: "nsmanRelief" as const, label: "NSman Relief", cap: RELIEF_CAPS.nsmanRelief },
                                                { name: "parentRelief" as const, label: "Parent / Grandparent Relief", cap: RELIEF_CAPS.parentRelief },
                                                { name: "courseFeesRelief" as const, label: "Course Fees Relief", cap: RELIEF_CAPS.courseFeesRelief },
                                                { name: "srsRelief" as const, label: "SRS Relief", cap: RELIEF_CAPS.srsReliefCitizenPR },
                                                { name: "otherReliefs" as const, label: "Other Reliefs", cap: null },
                                            ].map(({ name, label, cap }) => (
                                                <FormField
                                                    key={name}
                                                    name={name}
                                                    control={form.control}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <div className="flex items-center justify-between">
                                                                <FormLabel className="text-xs">{label}</FormLabel>
                                                                {cap !== null && (
                                                                    <span className="text-xs text-muted-foreground">cap {formatSGD(cap)}</span>
                                                                )}
                                                            </div>
                                                            <FormControl>
                                                                <CurrencyInput
                                                                    prefix="S$"
                                                                    placeholder="0.00"
                                                                    value={field.value}
                                                                    decimalsLimit={2}
                                                                    decimalScale={2}
                                                                    onValueChange={field.onChange}
                                                                    className={currencyInputClass}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </form>
                            </Form>
                        </div>

                        {/* ── Right: Results ── */}
                        <div className="lg:col-span-3 space-y-5">
                            <div>
                                <p className="text-sm font-semibold mb-3">Tax Summary</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <ResultCard
                                        label="Annual Income"
                                        value={formatSGD(annualIncome)}
                                    />
                                    <ResultCard
                                        label="Total Reliefs"
                                        value={formatSGD(totalReliefs)}
                                        sub={`incl. EIR ${formatSGD(eir)}`}
                                    />
                                    <ResultCard
                                        label="Chargeable Income"
                                        value={formatSGD(chargeableIncome)}
                                    />
                                    <ResultCard
                                        label="Effective Tax Rate"
                                        value={`${effectiveRate.toFixed(2)}%`}
                                    />
                                    <ResultCard
                                        label="Annual Tax Payable"
                                        value={formatSGD(annualTax)}
                                        highlight
                                    />
                                    <ResultCard
                                        label="Est. Monthly Tax"
                                        value={formatSGD(annualTax / 12)}
                                        highlight
                                    />
                                </div>
                            </div>

                            {expectedSavingsRate > 0 && annualIncome > 0 && (
                                <Card className="border border-emerald-200 bg-emerald-50/50">
                                    <CardContent className="pt-4 pb-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Expected Monthly Savings (after tax, at {expectedSavingsRate}% rate)</p>
                                            <p className="text-2xl font-bold text-emerald-700 mt-0.5">
                                                {formatSGD(convertAmountFromMiliUnits(expectedMonthlySavings))}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="text-emerald-700 border-emerald-200">
                                            {expectedSavingsRate}% savings rate
                                        </Badge>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Bracket breakdown */}
                            {bracketBreakdown.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <p className="text-sm font-semibold">Tax Bracket Breakdown</p>
                                        <Info className="size-3.5 text-muted-foreground" />
                                    </div>
                                    <div className="rounded-md border overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Income Range</TableHead>
                                                    <TableHead className="text-right">Rate</TableHead>
                                                    <TableHead className="text-right">Taxable Amount</TableHead>
                                                    <TableHead className="text-right">Tax</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {bracketBreakdown.map((b) => (
                                                    <TableRow key={b.range}>
                                                        <TableCell className="text-xs">{b.range}</TableCell>
                                                        <TableCell className="text-right text-xs">
                                                            <Badge variant="outline">{b.rate}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right text-xs">{formatSGD(b.taxable)}</TableCell>
                                                        <TableCell className="text-right text-xs font-medium">{formatSGD(b.tax)}</TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow className="bg-muted/40 font-semibold">
                                                    <TableCell colSpan={3} className="text-sm">Total Tax</TableCell>
                                                    <TableCell className="text-right text-sm">{formatSGD(annualTax)}</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                        <Info className="size-3 shrink-0" />
                                        Figures are estimates only. Consult IRAS or a tax professional for your actual assessment.
                                    </p>
                                </div>
                            )}

                            {annualIncome === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                    <Receipt className="size-10 mb-3 opacity-30" />
                                    <p className="text-sm">Enter your annual income to see your tax estimate.</p>
                                    {profile && (
                                        <p className="text-xs mt-1">
                                            Profile prefilled — adjust the values on the left as needed.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TaxCalculatorPage;
