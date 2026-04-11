"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import CurrencyInput from "react-currency-input-field";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/utils";

const InterestCalcPage = () => {
    const [principal, setPrincipal] = useState<string>("10000");
    const [rate, setRate] = useState<string>("5");
    const [years, setYears] = useState<number>(10);
    const [contribution, setContribution] = useState<string>("500");

    const calculateGrowth = () => {
        const p = parseFloat(principal);
        const r = parseFloat(rate) / 100;
        const n = 12; // Monthly compounding
        const t = years;
        const c = parseFloat(contribution);

        let currentBalance = p;
        const data = [];

        for (let i = 0; i <= t; i++) {
            data.push({
                year: i,
                value: Math.round(currentBalance),
                invested: Math.round(p + (c * 12 * i)),
            });
            
            // Compound for next year
            for (let m = 0; m < 12; m++) {
                currentBalance = (currentBalance * (1 + r/n)) + c;
            }
        }
        return data;
    }

    const data = calculateGrowth();
    const finalValue = data[data.length - 1].value;
    const totalInvested = data[data.length - 1].invested;
    const totalInterest = finalValue - totalInvested;

    return (
        <div className="max-w-screen-2xl mx-auto w-full pb-10">
            <Card className="border-none drop-shadow-md">
                <CardHeader>
                    <CardTitle className="text-xl">
                        Interest Calculator
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Inputs */}
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Initial Principal</label>
                                <CurrencyInput
                                    prefix="$"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={principal}
                                    onValueChange={(val) => setPrincipal(val || "0")}
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Annual Interest Rate (%)</label>
                                <CurrencyInput
                                    suffix="%"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={rate}
                                    onValueChange={(val) => setRate(val || "0")}
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Time Period (Years)</label>
                                <Input
                                    type="number"
                                    value={years}
                                    onChange={(e) => setYears(parseInt(e.target.value) || 0)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Monthly Contribution</label>
                                <CurrencyInput
                                    prefix="$"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={contribution}
                                    onValueChange={(val) => setContribution(val || "0")}
                                />
                            </div>
                        </div>

                        {/* Results */}
                        <div className="space-y-6">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="p-4 bg-slate-100 rounded-lg">
                                    <div className="text-xs text-muted-foreground uppercase font-bold">Total Invested</div>
                                    <div className="text-lg font-bold text-slate-700">{formatCurrency(totalInvested)}</div>
                                </div>
                                <div className="p-4 bg-slate-100 rounded-lg">
                                    <div className="text-xs text-muted-foreground uppercase font-bold">Interest Earned</div>
                                    <div className="text-lg font-bold text-emerald-600">{formatCurrency(totalInterest)}</div>
                                </div>
                                <div className="p-4 bg-slate-100 rounded-lg">
                                    <div className="text-xs text-muted-foreground uppercase font-bold">Future Value</div>
                                    <div className="text-lg font-bold text-blue-600">{formatCurrency(finalValue)}</div>
                                </div>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="year" />
                                        <YAxis tickFormatter={(val) => `$${val/1000}k`} />
                                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                        <Area type="monotone" dataKey="value" stroke="#2563eb" fillOpacity={1} fill="url(#colorValue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default InterestCalcPage