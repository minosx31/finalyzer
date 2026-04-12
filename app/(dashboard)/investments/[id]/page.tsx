"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Pencil, Trash2, X, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { InvestmentForm } from "@/features/investments/components/investment-form";
import {
    useGetInvestment,
    useEditInvestment,
    useDeleteInvestment,
    useGetDividends,
} from "@/features/investments/api/index";
import { useConfirm } from "@/hooks/use-confirm";
import { convertAmountFromMiliUnits, formatSGD } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

const InvestmentDetailPage = ({ params }: Props) => {
    const { id } = use(params);
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const { data: investment, isLoading } = useGetInvestment(id);
    const editInvestment = useEditInvestment(id);
    const deleteInvestment = useDeleteInvestment(id);
    const { data: allDividends = [] } = useGetDividends();
    const [ConfirmDialog, confirm] = useConfirm("Delete Investment", "This holding will be permanently removed from your portfolio.");

    const dividends = allDividends.filter((d) => d.investmentId === id);

    if (isLoading) return (
        <div className="max-w-screen-sm mx-auto w-full space-y-4">
            <Skeleton className="h-8 w-32" /><Skeleton className="h-64 rounded-xl" />
        </div>
    );

    if (!investment) return (
        <div className="max-w-screen-sm mx-auto w-full space-y-4">
            <Button variant="ghost" size="sm" asChild>
                <Link href="/investments"><ArrowLeft className="size-4 mr-2" />Back</Link>
            </Button>
            <p className="text-muted-foreground">Investment not found.</p>
        </div>
    );

    const handleDelete = async () => {
        const ok = await confirm();
        if (ok) deleteInvestment.mutate(undefined, { onSuccess: () => router.push("/investments") });
    };

    const shares = investment.shares / 1000;
    const avgCost = convertAmountFromMiliUnits(investment.avgCostPrice);
    const currentPrice = convertAmountFromMiliUnits(investment.currentPrice);
    const costBasis = shares * avgCost;
    const marketValue = shares * currentPrice;
    const gainLoss = marketValue - costBasis;
    const gainLossPct = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;
    const isPositive = gainLoss >= 0;

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("en-SG", { style: "currency", currency: investment.currency, minimumFractionDigits: 2 }).format(value);

    const defaultFormValues = {
        ticker: investment.ticker,
        name: investment.name,
        type: investment.type as "stock" | "etf" | "reit" | "bond" | "crypto" | "other",
        exchange: investment.exchange ?? undefined,
        shares: String(shares),
        avgCostPrice: String(avgCost),
        currentPrice: String(currentPrice),
        currency: investment.currency,
    };

    return (
        <div className="max-w-screen-sm mx-auto w-full space-y-4">
            <ConfirmDialog />
            <Button variant="ghost" size="sm" asChild>
                <Link href="/investments"><ArrowLeft className="size-4 mr-2" />Back to Portfolio</Link>
            </Button>
            <Card>
                <CardHeader className="flex-row items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-xl font-mono">{investment.ticker}</CardTitle>
                            <Badge variant="outline" className="capitalize">{investment.type}</Badge>
                            <Badge variant="secondary">{investment.currency}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{investment.name}</p>
                        {investment.exchange && (
                            <p className="text-xs text-muted-foreground">{investment.exchange}</p>
                        )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                        {isEditing ? (
                            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}><X className="size-4" /></Button>
                        ) : (
                            <>
                                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}><Pencil className="size-4 mr-1" />Edit</Button>
                                <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleteInvestment.isPending}
                                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
                                    <Trash2 className="size-4 mr-1" />Delete
                                </Button>
                            </>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <InvestmentForm
                            id={id}
                            defaultValues={defaultFormValues}
                            onSubmit={(values) => editInvestment.mutate(values as Parameters<typeof editInvestment.mutate>[0], { onSuccess: () => setIsEditing(false) })}
                            disabled={editInvestment.isPending}
                        />
                    ) : (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg bg-muted/40 p-3">
                                    <p className="text-xs text-muted-foreground mb-1">Shares Held</p>
                                    <p className="text-lg font-bold tabular-nums">{shares.toFixed(3)}</p>
                                </div>
                                <div className="rounded-lg bg-muted/40 p-3">
                                    <p className="text-xs text-muted-foreground mb-1">Avg Cost Price</p>
                                    <p className="text-lg font-bold tabular-nums">{formatCurrency(avgCost)}</p>
                                </div>
                                <div className="rounded-lg bg-muted/40 p-3">
                                    <p className="text-xs text-muted-foreground mb-1">Current Price</p>
                                    <p className="text-lg font-bold tabular-nums">{formatCurrency(currentPrice)}</p>
                                </div>
                                <div className="rounded-lg bg-muted/40 p-3">
                                    <p className="text-xs text-muted-foreground mb-1">Market Value</p>
                                    <p className="text-lg font-bold tabular-nums">{formatCurrency(marketValue)}</p>
                                </div>
                            </div>
                            <div className={`rounded-lg p-3 ${isPositive ? "bg-emerald-50 border border-emerald-200" : "bg-rose-50 border border-rose-200"}`}>
                                <p className="text-xs text-muted-foreground mb-1">Unrealized Gain / Loss</p>
                                <p className={`text-xl font-bold tabular-nums ${isPositive ? "text-emerald-700" : "text-rose-700"}`}>
                                    {isPositive ? "+" : ""}{formatCurrency(gainLoss)}
                                </p>
                                <p className={`text-sm ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                                    {isPositive ? "+" : ""}{gainLossPct.toFixed(2)}% · Cost basis {formatCurrency(costBasis)}
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {dividends.length > 0 && !isEditing && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <DollarSign className="size-4 text-amber-600" />
                            <CardTitle className="text-base">Dividend History</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Separator className="mb-3" />
                        <div className="space-y-2">
                            {dividends.map((div) => (
                                <div key={div.id} className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">
                                        {format(new Date(div.date), "d MMM yyyy")}
                                    </span>
                                    <span className="font-medium text-amber-700 tabular-nums">
                                        {formatSGD(convertAmountFromMiliUnits(div.amount))}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
                            Total: {formatSGD(dividends.reduce((sum, d) => sum + convertAmountFromMiliUnits(d.amount), 0))}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default InvestmentDetailPage;
