"use client";

import {
    ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Loader2, TrendingUp, ArrowRight, CalendarClock, Info } from "lucide-react";
import Link from "next/link";

import { useGetForecast } from "@/features/forecast/api/use-get-forecast";
import { convertAmountFromMiliUnits, formatSGD } from "@/lib/utils";

const CashflowForecastPage = () => {
    const forecastQuery = useGetForecast();
    const forecast = forecastQuery.data ?? [];

    const chartData = forecast.map((m) => ({
        month: m.month,
        Income: Math.round(convertAmountFromMiliUnits(m.projectedIncome)),
        Expenses: Math.round(convertAmountFromMiliUnits(m.projectedExpenses)),
        Balance: Math.round(convertAmountFromMiliUnits(m.projectedBalance)),
    }));

    const hasRecurring = forecast.some((m) => m.recurringItems.length > 0);
    const hasIncome = forecast.some((m) => m.projectedIncome > 0);

    const totalProjectedIncome = forecast.reduce((s, m) => s + m.projectedIncome, 0);
    const totalProjectedExpenses = forecast.reduce((s, m) => s + m.projectedExpenses, 0);
    const totalProjectedBalance = totalProjectedIncome - totalProjectedExpenses;

    if (forecastQuery.isLoading) {
        return (
            <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
                <Card className="border-none drop-shadow-md">
                    <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
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
                        <TrendingUp className="size-5 text-muted-foreground" />
                        <CardTitle className="text-xl">6-Month Cashflow Forecast</CardTitle>
                    </div>
                    <CardDescription>
                        Projected income and expenses based on your recurring items and average monthly income.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!hasRecurring && !hasIncome ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                            <CalendarClock className="size-12 text-muted-foreground opacity-30" />
                            <div>
                                <p className="font-semibold">No data to forecast</p>
                                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                                    Add recurring expenses and record some income transactions to generate a cashflow forecast.
                                </p>
                            </div>
                            <Link
                                href="/manage/recurring"
                                className="flex items-center gap-1 text-sm text-blue-600 underline underline-offset-2"
                            >
                                Add Recurring Expenses <ArrowRight className="size-3.5" />
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* 6-month totals */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Card className="border bg-blue-50/50 border-blue-200">
                                    <CardContent className="pt-4 pb-3">
                                        <p className="text-xs text-muted-foreground">6-Month Projected Income</p>
                                        <p className="text-2xl font-bold mt-0.5 text-blue-700">
                                            {formatSGD(convertAmountFromMiliUnits(totalProjectedIncome))}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            ~{formatSGD(convertAmountFromMiliUnits(Math.round(totalProjectedIncome / 6)))} / month
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="border bg-rose-50/50 border-rose-200">
                                    <CardContent className="pt-4 pb-3">
                                        <p className="text-xs text-muted-foreground">6-Month Projected Expenses</p>
                                        <p className="text-2xl font-bold mt-0.5 text-rose-700">
                                            {formatSGD(convertAmountFromMiliUnits(totalProjectedExpenses))}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            ~{formatSGD(convertAmountFromMiliUnits(Math.round(totalProjectedExpenses / 6)))} / month
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className={`border ${totalProjectedBalance >= 0 ? "bg-emerald-50/50 border-emerald-200" : "bg-rose-50/50 border-rose-200"}`}>
                                    <CardContent className="pt-4 pb-3">
                                        <p className="text-xs text-muted-foreground">6-Month Net Balance</p>
                                        <p className={`text-2xl font-bold mt-0.5 ${totalProjectedBalance >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                                            {totalProjectedBalance >= 0 ? "+" : ""}{formatSGD(convertAmountFromMiliUnits(totalProjectedBalance))}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {totalProjectedBalance >= 0 ? "Surplus projected" : "Deficit projected"}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Chart */}
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Monthly Breakdown</p>
                                <ResponsiveContainer width="100%" height={320}>
                                    <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="month"
                                            tick={{ fontSize: 11 }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 11 }}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(v) => `S$${(v / 1000).toFixed(0)}k`}
                                        />
                                        <Tooltip
                                            formatter={(value: number) => [formatSGD(value), ""]}
                                            labelStyle={{ fontSize: 12 }}
                                            contentStyle={{ fontSize: 12 }}
                                        />
                                        <Legend />
                                        <ReferenceLine y={0} stroke="#888" strokeDasharray="3 3" />
                                        <Bar dataKey="Income" fill="#3D82F6" opacity={0.85} radius={[3, 3, 0, 0]} />
                                        <Bar dataKey="Expenses" fill="#F43F5E" opacity={0.85} radius={[3, 3, 0, 0]} />
                                        <Line type="monotone" dataKey="Balance" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4 }} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>

                            <Separator />

                            {/* Per-month cards */}
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Month-by-Month</p>
                                <div className="space-y-3">
                                    {forecast.map((m) => {
                                        const balance = convertAmountFromMiliUnits(m.projectedBalance);
                                        const income = convertAmountFromMiliUnits(m.projectedIncome);
                                        const expenses = convertAmountFromMiliUnits(m.projectedExpenses);
                                        const isDeficit = balance < 0;

                                        return (
                                            <div key={m.monthKey} className="rounded-md border p-4 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline">{m.month}</Badge>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <span className="text-muted-foreground text-xs">
                                                            In: <span className="text-blue-600 font-medium">{formatSGD(income)}</span>
                                                        </span>
                                                        <span className="text-muted-foreground text-xs">
                                                            Out: <span className="text-rose-600 font-medium">{formatSGD(expenses)}</span>
                                                        </span>
                                                        <span className={`font-semibold text-sm ${isDeficit ? "text-rose-600" : "text-emerald-600"}`}>
                                                            {balance >= 0 ? "+" : ""}{formatSGD(balance)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {m.recurringItems.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {m.recurringItems.map((item, i) => (
                                                            <span key={i} className="inline-flex items-center gap-1 text-xs bg-muted rounded px-2 py-0.5">
                                                                {item.name}
                                                                <span className="text-muted-foreground">
                                                                    {formatSGD(convertAmountFromMiliUnits(item.amount))}
                                                                </span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Info className="size-3 shrink-0" />
                                Income is estimated from your average over the last 3 months. Expenses are based on your{" "}
                                <Link href="/manage/recurring" className="underline underline-offset-2">
                                    recurring items
                                </Link>.
                            </p>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default CashflowForecastPage;
