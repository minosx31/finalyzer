"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, TrendingDown, AlertCircle, Info } from "lucide-react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { computeAvalanche, computeSnowball, type Debt } from "@/lib/debt-payoff";
import { convertAmountFromMiliUnits, formatSGD } from "@/lib/utils";

const DebtPlannerPage = () => {
    const accountsQuery = useGetAccounts();
    const [monthlyPayment, setMonthlyPayment] = useState("");

    const accounts = accountsQuery.data ?? [];

    // Credit accounts with a usable interest rate
    const creditAccounts = accounts.filter(
        (a) => a.type === "credit" && (a.interestRate ?? 0) > 0
    );

    // Map to Debt shape — balance from transactions sum is not on accounts; use creditLimit as proxy
    // The accounts GET returns balance (nullable) and creditLimit. For debt calculation we need
    // the outstanding balance. We treat a negative balance as outstanding debt.
    const debts: Debt[] = creditAccounts.map((a) => {
        // balance from GET /accounts is nullable and represents a cached value
        // We use Math.abs of a negative balance, or creditLimit as a rough fallback
        const outstandingMilli = a.balance != null && a.balance < 0
            ? Math.abs(a.balance)
            : a.creditLimit ?? 0;
        const minPayment = Math.round(outstandingMilli * 0.02); // standard 2% min payment
        return {
            id: a.id,
            name: a.name,
            balance: outstandingMilli,
            interestRate: a.interestRate ?? 0, // basis points
            minPayment,
        };
    });

    const totalMinPayment = debts.reduce((sum, d) => sum + d.minPayment, 0);
    const parsedPayment = parseFloat(monthlyPayment) || 0;
    const paymentMilli = Math.round(parsedPayment * 1000);
    const canCompute = debts.length > 0 && paymentMilli >= totalMinPayment;

    const avalanche = canCompute ? computeAvalanche(debts, paymentMilli) : null;
    const snowball = canCompute ? computeSnowball(debts, paymentMilli) : null;

    const interestSaved = (avalanche && snowball)
        ? snowball.totalInterestPaid - avalanche.totalInterestPaid
        : 0;

    if (accountsQuery.isLoading) {
        return (
            <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
                <Card className="border-none drop-shadow-md">
                    <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
                    <CardContent>
                        <div className="h-[400px] w-full flex items-center justify-center">
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
                        <TrendingDown className="size-5 text-muted-foreground" />
                        <CardTitle className="text-xl">Debt Payoff Planner</CardTitle>
                    </div>
                    <CardDescription>
                        Compare the Avalanche (lowest interest cost) vs Snowball (fastest first win) strategies
                        for paying off your credit accounts.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {creditAccounts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                            <AlertCircle className="size-10 text-muted-foreground" />
                            <div>
                                <p className="font-semibold">No credit accounts found</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Add a credit account with an interest rate in{" "}
                                    <a href="/manage/accounts" className="underline underline-offset-2 text-blue-600">
                                        Manage → Accounts
                                    </a>{" "}
                                    to use the debt planner.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Debt summary */}
                            <div>
                                <p className="text-sm font-semibold mb-3">Credit Accounts</p>
                                <div className="rounded-md border overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Account</TableHead>
                                                <TableHead className="text-right">Outstanding</TableHead>
                                                <TableHead className="text-right">Interest Rate</TableHead>
                                                <TableHead className="text-right">Est. Min. Payment</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {debts.map((d) => (
                                                <TableRow key={d.id}>
                                                    <TableCell className="font-medium">{d.name}</TableCell>
                                                    <TableCell className="text-right">
                                                        {formatSGD(convertAmountFromMiliUnits(d.balance))}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Badge variant="outline">
                                                            {(d.interestRate / 100).toFixed(2)}% p.a.
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right text-muted-foreground">
                                                        {formatSGD(convertAmountFromMiliUnits(d.minPayment))}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            {/* Payment input */}
                            <div className="max-w-xs space-y-1.5">
                                <Label htmlFor="monthly-payment">Total Monthly Payment (SGD)</Label>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">S$</span>
                                    <Input
                                        id="monthly-payment"
                                        type="number"
                                        min={convertAmountFromMiliUnits(totalMinPayment)}
                                        step={50}
                                        placeholder={`min ${convertAmountFromMiliUnits(totalMinPayment).toFixed(0)}`}
                                        value={monthlyPayment}
                                        onChange={(e) => setMonthlyPayment(e.target.value)}
                                        className="w-36"
                                    />
                                </div>
                                {parsedPayment > 0 && parsedPayment < convertAmountFromMiliUnits(totalMinPayment) && (
                                    <p className="text-xs text-rose-600 flex items-center gap-1">
                                        <AlertCircle className="size-3" />
                                        Below minimum payment of{" "}
                                        {formatSGD(convertAmountFromMiliUnits(totalMinPayment))}
                                    </p>
                                )}
                            </div>

                            {/* Strategy comparison */}
                            {avalanche && snowball ? (
                                <>
                                    {interestSaved > 0 && (
                                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-md px-4 py-3">
                                            <Info className="size-4 shrink-0" />
                                            Avalanche saves you{" "}
                                            <span className="font-semibold">
                                                {formatSGD(convertAmountFromMiliUnits(interestSaved))}
                                            </span>{" "}
                                            in interest vs Snowball.
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            {
                                                label: "Avalanche",
                                                sub: "Highest interest first — saves the most money",
                                                summary: avalanche,
                                                accent: "border-blue-200 bg-blue-50/50",
                                                badge: "text-blue-700 border-blue-200",
                                            },
                                            {
                                                label: "Snowball",
                                                sub: "Smallest balance first — quickest early wins",
                                                summary: snowball,
                                                accent: "border-purple-200 bg-purple-50/50",
                                                badge: "text-purple-700 border-purple-200",
                                            },
                                        ].map(({ label, sub, summary, accent, badge }) => (
                                            <Card key={label} className={`border ${accent}`}>
                                                <CardHeader className="pb-2">
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle className="text-base">{label}</CardTitle>
                                                        <Badge variant="outline" className={badge}>
                                                            {label === "Avalanche" ? "Saves most" : "Quickest win"}
                                                        </Badge>
                                                    </div>
                                                    <CardDescription className="text-xs">{sub}</CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Total months</p>
                                                            <p className="text-lg font-bold">
                                                                {summary.totalMonths}
                                                                <span className="text-xs font-normal text-muted-foreground ml-1">mo</span>
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Total interest</p>
                                                            <p className="text-lg font-bold">
                                                                {formatSGD(convertAmountFromMiliUnits(summary.totalInterestPaid))}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <Separator />

                                                    <div className="space-y-1.5">
                                                        {summary.results.map((r) => (
                                                            <div key={r.id} className="flex items-center justify-between text-xs">
                                                                <span className="text-muted-foreground truncate max-w-[120px]">{r.name}</span>
                                                                <div className="flex items-center gap-2 shrink-0">
                                                                    <span>{r.months} mo</span>
                                                                    <span className="text-muted-foreground">
                                                                        +{formatSGD(convertAmountFromMiliUnits(r.totalInterest))} int.
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-sm text-muted-foreground flex items-center gap-2 py-4">
                                    <Info className="size-4 shrink-0" />
                                    Enter a total monthly payment above to compare strategies.
                                </div>
                            )}

                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Info className="size-3 shrink-0" />
                                Estimates use a 2% minimum payment and the interest rates set on your accounts.
                                Update rates in{" "}
                                <a href="/manage/accounts" className="underline underline-offset-2">
                                    Manage → Accounts
                                </a>.
                            </p>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default DebtPlannerPage;
