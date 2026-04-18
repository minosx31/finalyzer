"use client";

import { useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, TrendingUp, Wallet, BarChart3, DollarSign, Trash2, Info } from "lucide-react";
import { useConfirm } from "@/hooks/use-confirm";
import {
    useGetInvestments,
    useGetDividends,
    useCreateDividend,
    useDeleteDividend,
} from "@/features/investments/api/index";
import { convertAmountFromMiliUnits, convertAmountToMiliUnits, formatSGD } from "@/lib/utils";

const DividendDeleteButton = ({ id }: { id: string }) => {
    const deleteMutation = useDeleteDividend(id);
    const [ConfirmDialog, confirm] = useConfirm("Delete dividend?", "This will permanently remove this dividend record.");
    const handleDelete = async () => {
        const ok = await confirm();
        if (ok) deleteMutation.mutate();
    };
    return (
        <>
            <ConfirmDialog />
            <Button variant="ghost" size="sm" className="size-8 p-0 text-muted-foreground hover:text-rose-600"
                disabled={deleteMutation.isPending} onClick={handleDelete}>
                {deleteMutation.isPending
                    ? <Loader2 className="size-3.5 animate-spin" />
                    : <Trash2 className="size-3.5" />}
            </Button>
        </>
    );
};

const InvestmentsPage = () => {
    const investmentsQuery = useGetInvestments();
    const dividendsQuery = useGetDividends();
    const createDividend = useCreateDividend();

    const [divInvestmentId, setDivInvestmentId] = useState("");
    const [divAmount, setDivAmount] = useState("");
    const [divDate, setDivDate] = useState(format(new Date(), "yyyy-MM-dd"));

    const investments = investmentsQuery.data ?? [];
    const dividends = dividendsQuery.data ?? [];
    const isLoading = investmentsQuery.isLoading || dividendsQuery.isLoading;

    type CurrencySummary = { costBasis: number; marketValue: number; unrealizedPL: number };
    const byCurrency: Record<string, CurrencySummary> = {};
    for (const inv of investments) {
        const shares = inv.shares / 1000;
        const cost = convertAmountFromMiliUnits(inv.avgCostPrice);
        const price = convertAmountFromMiliUnits(inv.currentPrice);
        if (!byCurrency[inv.currency]) byCurrency[inv.currency] = { costBasis: 0, marketValue: 0, unrealizedPL: 0 };
        byCurrency[inv.currency].costBasis += shares * cost;
        byCurrency[inv.currency].marketValue += shares * price;
        byCurrency[inv.currency].unrealizedPL += shares * (price - cost);
    }

    const currentYear = new Date().getFullYear();
    const dividendsYTDSGD = dividends
        .filter((d) => new Date(d.date).getFullYear() === currentYear)
        .reduce((sum, d) => sum + convertAmountFromMiliUnits(d.amount), 0);

    const sgd = byCurrency["SGD"] ?? { costBasis: 0, marketValue: 0, unrealizedPL: 0 };
    const otherCurrencies = Object.entries(byCurrency).filter(([c]) => c !== "SGD");

    const handleLogDividend = () => {
        if (!divInvestmentId || !divAmount || !divDate) return;
        createDividend.mutate(
            { investmentId: divInvestmentId, amount: convertAmountToMiliUnits(parseFloat(divAmount)), date: divDate },
            { onSuccess: () => { setDivAmount(""); setDivDate(format(new Date(), "yyyy-MM-dd")); } }
        );
    };

    if (isLoading) {
        return (
            <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
                <Card className="border-none drop-shadow-md">
                    <CardHeader><div className="h-8 w-48 bg-muted animate-pulse rounded" /></CardHeader>
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
                <CardHeader className="gap-y-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <BarChart3 className="size-5 text-muted-foreground" />
                            <CardTitle className="text-xl">Investment Portfolio</CardTitle>
                        </div>
                        <CardDescription className="mt-1">
                            Track your holdings, unrealized gains, and dividend income.
                        </CardDescription>
                    </div>
                    <Button size="sm" asChild>
                        <Link href="/investments/new">
                            <Plus className="size-4 mr-2" />Add Holding
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Card className="border bg-blue-50/50 border-blue-200">
                            <CardContent className="pt-4 pb-3">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                                    <Wallet className="size-3.5" />Cost Basis (SGD)
                                </div>
                                <p className="text-xl font-bold text-blue-700">{formatSGD(sgd.costBasis)}</p>
                                {otherCurrencies.map(([c, s]) => (
                                    <p key={c} className="text-xs text-muted-foreground mt-0.5">+ {c} {s.costBasis.toFixed(2)}</p>
                                ))}
                            </CardContent>
                        </Card>
                        <Card className="border bg-muted/30">
                            <CardContent className="pt-4 pb-3">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                                    <TrendingUp className="size-3.5" />Market Value (SGD)
                                </div>
                                <p className="text-xl font-bold">{formatSGD(sgd.marketValue)}</p>
                                {otherCurrencies.map(([c, s]) => (
                                    <p key={c} className="text-xs text-muted-foreground mt-0.5">+ {c} {s.marketValue.toFixed(2)}</p>
                                ))}
                            </CardContent>
                        </Card>
                        <Card className={`border ${sgd.unrealizedPL >= 0 ? "bg-emerald-50/50 border-emerald-200" : "bg-rose-50/50 border-rose-200"}`}>
                            <CardContent className="pt-4 pb-3">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                                    <TrendingUp className="size-3.5" />Unrealized P/L (SGD)
                                </div>
                                <p className={`text-xl font-bold ${sgd.unrealizedPL >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                                    {sgd.unrealizedPL >= 0 ? "+" : ""}{formatSGD(sgd.unrealizedPL)}
                                </p>
                                {sgd.costBasis > 0 && (
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {((sgd.unrealizedPL / sgd.costBasis) * 100).toFixed(2)}% overall
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                        <Card className="border bg-amber-50/50 border-amber-200">
                            <CardContent className="pt-4 pb-3">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                                    <DollarSign className="size-3.5" />Dividends YTD
                                </div>
                                <p className="text-xl font-bold text-amber-700">{formatSGD(dividendsYTDSGD)}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {dividends.filter((d) => new Date(d.date).getFullYear() === currentYear).length} payments
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Separator />

                    <Tabs defaultValue="holdings">
                        <TabsList className="mb-4">
                            <TabsTrigger value="holdings">Holdings</TabsTrigger>
                            <TabsTrigger value="dividends">Dividends</TabsTrigger>
                        </TabsList>

                        <TabsContent value="holdings">
                            {investments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                                    <BarChart3 className="size-12 text-muted-foreground opacity-30" />
                                    <div>
                                        <p className="font-semibold">No holdings yet</p>
                                        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                                            Add your first investment holding to start tracking your portfolio.
                                        </p>
                                    </div>
                                    <Button size="sm" asChild>
                                        <Link href="/investments/new"><Plus className="size-4 mr-2" />Add Holding</Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {investments.map((inv) => {
                                        const shares = inv.shares / 1000;
                                        const cost = convertAmountFromMiliUnits(inv.avgCostPrice);
                                        const price = convertAmountFromMiliUnits(inv.currentPrice);
                                        const marketValue = shares * price;
                                        const gainLossPct = cost > 0 ? ((price - cost) / cost) * 100 : 0;
                                        const isPositive = gainLossPct >= 0;
                                        return (
                                            <Link key={inv.id} href={`/investments/${inv.id}`}>
                                                <div className="flex items-center justify-between px-4 py-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                                                    <div className="flex items-center gap-3">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono font-semibold">{inv.ticker}</span>
                                                                <Badge variant="outline" className="capitalize text-xs">{inv.type}</Badge>
                                                                {inv.exchange && <span className="text-xs text-muted-foreground">{inv.exchange}</span>}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{inv.name}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-6 text-right">
                                                        <div className="hidden sm:block">
                                                            <p className="text-xs text-muted-foreground">Shares</p>
                                                            <p className="text-sm font-medium tabular-nums">{shares.toFixed(3)}</p>
                                                        </div>
                                                        <div className="hidden md:block">
                                                            <p className="text-xs text-muted-foreground">Market Value</p>
                                                            <p className="text-sm font-medium tabular-nums">
                                                                {new Intl.NumberFormat("en-SG", { style: "currency", currency: inv.currency }).format(marketValue)}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Gain/Loss</p>
                                                            <p className={`text-sm font-semibold tabular-nums ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                                                                {isPositive ? "+" : ""}{gainLossPct.toFixed(2)}%
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="dividends" className="space-y-6">
                            <div className="rounded-md border p-4 space-y-3">
                                <p className="text-sm font-semibold">Log Dividend</p>
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Holding</Label>
                                        <Select value={divInvestmentId} onValueChange={setDivInvestmentId}>
                                            <SelectTrigger className="h-9 text-sm">
                                                <SelectValue placeholder="Select holding" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {investments.map((inv) => (
                                                    <SelectItem key={inv.id} value={inv.id}>
                                                        {inv.ticker} — {inv.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Amount (SGD)</Label>
                                        <div className="flex items-center gap-1">
                                            <span className="text-sm text-muted-foreground">S$</span>
                                            <Input type="number" min={0} step={0.01} placeholder="0.00"
                                                value={divAmount} onChange={(e) => setDivAmount(e.target.value)} className="h-9 text-sm" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Date</Label>
                                        <Input type="date" value={divDate} onChange={(e) => setDivDate(e.target.value)} className="h-9 text-sm" />
                                    </div>
                                    <Button size="sm" onClick={handleLogDividend}
                                        disabled={!divInvestmentId || !divAmount || createDividend.isPending} className="h-9">
                                        {createDividend.isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : <Plus className="size-4 mr-2" />}
                                        Log
                                    </Button>
                                </div>
                            </div>

                            {dividends.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
                                    <DollarSign className="size-10 text-muted-foreground opacity-30" />
                                    <p className="font-semibold">No dividends recorded</p>
                                    <p className="text-sm text-muted-foreground">Use the form above to log dividend payments.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Dividend History</p>
                                    <div className="rounded-md border overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/40">
                                                <tr className="border-b">
                                                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Date</th>
                                                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Holding</th>
                                                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Ticker</th>
                                                    <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Amount (SGD)</th>
                                                    <th className="px-2 py-2.5"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dividends.map((div) => (
                                                    <tr key={div.id} className="border-b last:border-0 hover:bg-muted/20">
                                                        <td className="px-4 py-3 text-muted-foreground">{format(new Date(div.date), "d MMM yyyy")}</td>
                                                        <td className="px-4 py-3 max-w-[160px] truncate">{div.investmentName ?? "—"}</td>
                                                        <td className="px-4 py-3">
                                                            <Badge variant="outline" className="font-mono text-xs">{div.ticker ?? "—"}</Badge>
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-medium tabular-nums text-amber-700">
                                                            {formatSGD(convertAmountFromMiliUnits(div.amount))}
                                                        </td>
                                                        <td className="px-2 py-3 text-right">
                                                            <DividendDeleteButton id={div.id} />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Info className="size-3 shrink-0" />
                                Dividend amounts are recorded in SGD. YTD total resets each calendar year.
                            </p>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default InvestmentsPage;
