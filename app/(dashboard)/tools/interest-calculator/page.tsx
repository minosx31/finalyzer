"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import CurrencyInput from "react-currency-input-field";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown, ChevronUp, Info } from "lucide-react";

const CURRENCY_INPUT_CLASS = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const InterestCalcPage = () => {
    const [principal, setPrincipal] = useState<string>("10000");
    const [rate, setRate] = useState<string>("5");
    const [years, setYears] = useState<number>(10);
    const [contribution, setContribution] = useState<string>("500");
    const [compoundFreq, setCompoundFreq] = useState<string>("12");
    const [tableOpen, setTableOpen] = useState(false);

    const calculateGrowth = () => {
        const p = Math.max(0, parseFloat(principal) || 0);
        const r = Math.min(100, Math.max(0, parseFloat(rate) || 0)) / 100;
        const n = parseInt(compoundFreq);
        const t = Math.min(100, Math.max(1, years));
        const c = Math.max(0, parseFloat(contribution) || 0);

        // Convert any compounding frequency to an equivalent monthly rate:
        // (1 + r/n)^(n/12) - 1. Multiplying out over 12 months reproduces
        // the exact same annual growth as n compounds per year would.
        const monthlyRate = Math.pow(1 + r / n, n / 12) - 1;

        let currentBalance = p;
        const data = [];

        for (let i = 0; i <= t; i++) {
            const totalInvested = Math.round(p + c * 12 * i);
            const totalValue = Math.round(currentBalance);
            data.push({
                year: i,
                value: totalValue,
                invested: totalInvested,
                interest: Math.max(0, totalValue - totalInvested),
            });

            for (let m = 0; m < 12; m++) {
                currentBalance = currentBalance * (1 + monthlyRate) + c;
            }
        }
        return data;
    };

    const data = calculateGrowth();
    const final = data[data.length - 1];
    const totalInvested = final.invested;
    const totalInterest = final.interest;
    const finalValue = final.value;
    const roi = totalInvested > 0 ? ((totalInterest / totalInvested) * 100).toFixed(1) : "0.0";
    const investedPct = finalValue > 0 ? (totalInvested / finalValue) * 100 : 0;

    const formatYAxis = (val: number) => {
        if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
        if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}k`;
        return `$${val}`;
    };

    return (
        <div className="max-w-screen-2xl mx-auto w-full pb-10">
            <Card className="border-none drop-shadow-md">
                <CardHeader>
                    <CardTitle className="text-xl">Interest Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
                        {/* Inputs */}
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Initial Principal</label>
                                <CurrencyInput
                                    prefix="$"
                                    className={CURRENCY_INPUT_CLASS}
                                    value={principal}
                                    onValueChange={(val) => setPrincipal(val || "0")}
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Annual Interest Rate</label>
                                <CurrencyInput
                                    suffix="%"
                                    className={CURRENCY_INPUT_CLASS}
                                    value={rate}
                                    onValueChange={(val) => setRate(val || "0")}
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Compounding Frequency</label>
                                <Select value={compoundFreq} onValueChange={setCompoundFreq}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="365">Daily</SelectItem>
                                        <SelectItem value="12">Monthly</SelectItem>
                                        <SelectItem value="4">Quarterly</SelectItem>
                                        <SelectItem value="1">Annually</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Time Period (Years)</label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={years}
                                    onChange={(e) => setYears(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Monthly Contribution</label>
                                <CurrencyInput
                                    prefix="$"
                                    className={CURRENCY_INPUT_CLASS}
                                    value={contribution}
                                    onValueChange={(val) => setContribution(val || "0")}
                                />
                            </div>
                        </div>

                        {/* Results */}
                        <div className="space-y-6">
                            {/* Summary stats */}
                            <TooltipProvider delayDuration={200}>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {([
                                        {
                                            label: "Amount Invested", value: formatCurrency(totalInvested),
                                            color: "text-slate-700", bg: "bg-slate-100",
                                            tip: "Your initial principal plus all monthly contributions made over the period.",
                                        },
                                        {
                                            label: "Interest Earned", value: formatCurrency(totalInterest),
                                            color: "text-emerald-600", bg: "bg-emerald-50",
                                            tip: "Growth purely from compounding — the difference between your future value and what you contributed.",
                                        },
                                        {
                                            label: "Future Value", value: formatCurrency(finalValue),
                                            color: "text-blue-600", bg: "bg-blue-50",
                                            tip: "Your projected total balance at the end of the period, including principal, contributions, and interest.",
                                        },
                                        {
                                            label: "ROI", value: `${roi}%`,
                                            color: "text-violet-600", bg: "bg-violet-50",
                                            tip: "Interest earned as a percentage of total amount invested. Does not account for inflation.",
                                        },
                                    ] as const).map(({ label, value, color, bg, tip }) => (
                                        <Tooltip key={label}>
                                            <TooltipTrigger asChild>
                                                <div className={`p-4 ${bg} rounded-xl cursor-default select-none`}>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground uppercase font-semibold tracking-wide">
                                                        {label}
                                                        <Info className="h-3 w-3 shrink-0 opacity-50" />
                                                    </div>
                                                    <div className={`text-lg font-bold ${color} mt-1`}>{value}</div>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom" className="max-w-[200px] text-center">
                                                {tip}
                                            </TooltipContent>
                                        </Tooltip>
                                    ))}
                                </div>
                            </TooltipProvider>

                            {/* Proportion bar */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                                        Invested ({investedPct.toFixed(1)}%)
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        Interest ({(100 - investedPct).toFixed(1)}%)
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                                    </span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-emerald-400 overflow-hidden">
                                    <div
                                        className="h-full bg-slate-400 rounded-full transition-all duration-500"
                                        style={{ width: `${investedPct}%` }}
                                    />
                                </div>
                            </div>

                            {/* Stacked area chart */}
                            <div className="h-[260px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.85} />
                                                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.35} />
                                            </linearGradient>
                                            <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.85} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.25} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis
                                            dataKey="year"
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 12 }}
                                            tickFormatter={(v) => `Y${v}`}
                                        />
                                        <YAxis
                                            tickFormatter={formatYAxis}
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 12 }}
                                            width={58}
                                        />
                                        <ChartTooltip
                                            formatter={(value, name) => [
                                                formatCurrency(Number(value)),
                                                name === "invested" ? "Amount Invested" : "Interest Earned",
                                            ]}
                                            labelFormatter={(label) => `Year ${label}`}
                                            contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: 13 }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="invested"
                                            stackId="1"
                                            stroke="#94a3b8"
                                            fill="url(#colorInvested)"
                                            strokeWidth={1.5}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="interest"
                                            stackId="1"
                                            stroke="#10b981"
                                            fill="url(#colorInterest)"
                                            strokeWidth={1.5}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Yearly breakdown table */}
                            <Collapsible open={tableOpen} onOpenChange={setTableOpen}>
                                <CollapsibleTrigger className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                    {tableOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    {tableOpen ? "Hide" : "Show"} yearly breakdown
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <div className="mt-3 rounded-lg border overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50 hover:bg-slate-50">
                                                    <TableHead className="w-16">Year</TableHead>
                                                    <TableHead className="text-right">Balance</TableHead>
                                                    <TableHead className="text-right">Amount Invested</TableHead>
                                                    <TableHead className="text-right">Interest Earned</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {data.map((row) => (
                                                    <TableRow key={row.year}>
                                                        <TableCell className="font-medium">{row.year}</TableCell>
                                                        <TableCell className="text-right font-semibold text-blue-600">{formatCurrency(row.value)}</TableCell>
                                                        <TableCell className="text-right text-slate-600">{formatCurrency(row.invested)}</TableCell>
                                                        <TableCell className="text-right text-emerald-600">{formatCurrency(row.interest)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default InterestCalcPage;
