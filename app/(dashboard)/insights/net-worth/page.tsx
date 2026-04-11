"use client";

import { format } from "date-fns";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, LineChart as LineChartIcon, Plus, TrendingUp, TrendingDown, Minus } from "lucide-react";

import { useGetNetWorthHistory } from "@/features/net-worth/api/use-get-net-worth-history";
import { useCreateNetWorthSnapshot } from "@/features/net-worth/api/use-create-net-worth-snapshot";
import { convertAmountFromMiliUnits, formatSGD } from "@/lib/utils";

const NetWorthPage = () => {
    const historyQuery = useGetNetWorthHistory();
    const snapshotMutation = useCreateNetWorthSnapshot();

    const snapshots = historyQuery.data ?? [];

    // Reverse for chart (oldest → newest)
    const chartData = [...snapshots].reverse().map((s) => ({
        date: format(new Date(s.snapshotDate), "MMM yyyy"),
        "Net Worth": Math.round(convertAmountFromMiliUnits(s.netWorth)),
        "Total Assets": Math.round(convertAmountFromMiliUnits(s.totalAssets)),
        "Liabilities": Math.round(convertAmountFromMiliUnits(s.totalLiabilities)),
    }));

    const latest = snapshots[0] ?? null;
    const previous = snapshots[1] ?? null;

    const netWorthChange = (latest && previous)
        ? convertAmountFromMiliUnits(latest.netWorth - previous.netWorth)
        : null;

    const NetWorthTrend = netWorthChange === null ? Minus
        : netWorthChange > 0 ? TrendingUp
        : TrendingDown;

    const trendColor = netWorthChange === null ? "text-muted-foreground"
        : netWorthChange > 0 ? "text-emerald-600"
        : "text-rose-600";

    if (historyQuery.isLoading) {
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
                <CardHeader className="gap-y-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <LineChartIcon className="size-5 text-muted-foreground" />
                            <CardTitle className="text-xl">Net Worth History</CardTitle>
                        </div>
                        <CardDescription className="mt-1">
                            Track your total assets minus liabilities over time. Take a snapshot each month to build history.
                        </CardDescription>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => snapshotMutation.mutate()}
                        disabled={snapshotMutation.isPending}
                    >
                        {snapshotMutation.isPending
                            ? <Loader2 className="mr-2 size-4 animate-spin" />
                            : <Plus className="mr-2 size-4" />
                        }
                        Take Snapshot
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    {snapshots.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                            <LineChartIcon className="size-12 text-muted-foreground opacity-30" />
                            <div>
                                <p className="font-semibold text-lg">No snapshots yet</p>
                                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                                    Take your first monthly snapshot to start tracking your net worth over time.
                                    The snapshot is computed automatically from your accounts.
                                </p>
                            </div>
                            <Button
                                onClick={() => snapshotMutation.mutate()}
                                disabled={snapshotMutation.isPending}
                            >
                                {snapshotMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                                Take First Snapshot
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Summary cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Card className="border bg-muted/30">
                                    <CardContent className="pt-4 pb-3">
                                        <p className="text-xs text-muted-foreground">Current Net Worth</p>
                                        <p className={`text-2xl font-bold mt-0.5 ${latest && latest.netWorth >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                                            {latest ? formatSGD(convertAmountFromMiliUnits(latest.netWorth)) : "—"}
                                        </p>
                                        {netWorthChange !== null && (
                                            <div className={`flex items-center gap-1 text-xs mt-1 ${trendColor}`}>
                                                <NetWorthTrend className="size-3" />
                                                {netWorthChange >= 0 ? "+" : ""}
                                                {formatSGD(Math.abs(netWorthChange))} vs last month
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                                <Card className="border bg-muted/30">
                                    <CardContent className="pt-4 pb-3">
                                        <p className="text-xs text-muted-foreground">Total Assets</p>
                                        <p className="text-2xl font-bold mt-0.5 text-blue-700">
                                            {latest ? formatSGD(convertAmountFromMiliUnits(latest.totalAssets)) : "—"}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {format(new Date(latest!.snapshotDate), "d MMM yyyy")}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="border bg-muted/30">
                                    <CardContent className="pt-4 pb-3">
                                        <p className="text-xs text-muted-foreground">Total Liabilities</p>
                                        <p className="text-2xl font-bold mt-0.5 text-rose-700">
                                            {latest ? formatSGD(convertAmountFromMiliUnits(latest.totalLiabilities)) : "—"}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {snapshots.length} snapshot{snapshots.length !== 1 ? "s" : ""} recorded
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Chart */}
                            {chartData.length > 1 ? (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">History</p>
                                    <ResponsiveContainer width="100%" height={320}>
                                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="date"
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
                                            <Line type="monotone" dataKey="Net Worth" stroke="#3D82F6" strokeWidth={2.5} dot={{ r: 4 }} />
                                            <Line type="monotone" dataKey="Total Assets" stroke="#10B981" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="4 2" />
                                            <Line type="monotone" dataKey="Liabilities" stroke="#F43F5E" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="4 2" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="rounded-md border bg-muted/20 p-4 text-center text-sm text-muted-foreground">
                                    Take at least 2 snapshots to see the trend chart.
                                </div>
                            )}

                            <Separator />

                            {/* Snapshot history list */}
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Snapshot History</p>
                                <div className="space-y-2">
                                    {snapshots.map((s) => (
                                        <div key={s.id} className="flex items-center justify-between rounded-md border px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className="text-xs">
                                                    {format(new Date(s.snapshotDate), "MMM yyyy")}
                                                </Badge>
                                                <div className="text-xs text-muted-foreground">
                                                    Assets {formatSGD(convertAmountFromMiliUnits(s.totalAssets))} · Liabilities {formatSGD(convertAmountFromMiliUnits(s.totalLiabilities))}
                                                </div>
                                            </div>
                                            <p className={`font-semibold text-sm ${s.netWorth >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                                                {s.netWorth >= 0 ? "+" : ""}{formatSGD(convertAmountFromMiliUnits(s.netWorth))}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default NetWorthPage;
