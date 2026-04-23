"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetGoals } from "@/features/goals/api";
import { convertAmountFromMiliUnits, formatCurrency } from "@/lib/utils";
import { useState, useMemo } from "react";
import CurrencyInput from "react-currency-input-field";
import { addMonths, differenceInMonths, format, isPast } from "date-fns";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip as ChartTooltip,
    XAxis,
    YAxis,
} from "recharts";
import { AlertTriangle, CheckCircle2, Info, Target } from "lucide-react";

const CURRENCY_INPUT_CLASS =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const SavingsGoalPage = () => {
    const { data: goals, isLoading } = useGetGoals();
    const [selectedGoalId, setSelectedGoalId] = useState<string>("");
    const [customContribution, setCustomContribution] = useState<string>("");

    const selectedGoal = goals?.find((g) => g.id === selectedGoalId);

    const calc = useMemo(() => {
        if (!selectedGoal) return null;

        const target = convertAmountFromMiliUnits(selectedGoal.targetAmount);
        const current = convertAmountFromMiliUnits(selectedGoal.currentAmount);
        const remaining = Math.max(0, target - current);
        const progressPct = target > 0 ? Math.min(100, (current / target) * 100) : 0;

        if (remaining === 0) return { isComplete: true as const, target, current, remaining: 0, progressPct };

        let monthsToDeadline: number | null = null;
        let deadlineDate: Date | null = null;
        let isDeadlinePassed = false;
        let requiredPMT: number | null = null;

        if (selectedGoal.deadline) {
            deadlineDate = new Date(selectedGoal.deadline);
            isDeadlinePassed = isPast(deadlineDate);
            monthsToDeadline = Math.max(0, differenceInMonths(deadlineDate, new Date()));

            if (!isDeadlinePassed && monthsToDeadline > 0) {
                requiredPMT = remaining / monthsToDeadline;
            }
        }

        const customPMT = parseFloat(customContribution) || null;
        const activePMT = customPMT ?? requiredPMT ?? 0;
        const projectedMonths = activePMT > 0 ? Math.ceil(remaining / activePMT) : null;

        const isOnTrack =
            customPMT !== null && requiredPMT !== null
                ? customPMT >= requiredPMT
                : null;

        const chartLength = Math.min(
            Math.max(monthsToDeadline ?? 0, projectedMonths ?? 0, 24),
            360,
        );

        const showBothLines = customPMT !== null && requiredPMT !== null && customPMT !== requiredPMT;

        const chartData = Array.from({ length: chartLength + 1 }, (_, m) => {
            const label = format(addMonths(new Date(), m), "MMM yy");
            const reqBal = requiredPMT !== null
                ? Math.min(Math.round(current + requiredPMT * m), Math.round(target))
                : undefined;
            const customBal = customPMT !== null
                ? Math.min(Math.round(current + customPMT * m), Math.round(target))
                : undefined;

            return {
                month: m,
                label,
                required: showBothLines ? reqBal : (reqBal ?? customBal),
                custom: showBothLines ? customBal : undefined,
            };
        });

        const deadlineMonth = monthsToDeadline !== null ? Math.min(monthsToDeadline, chartLength) : null;

        return {
            isComplete: false as const,
            isDeadlinePassed,
            target,
            current,
            remaining,
            progressPct,
            requiredPMT,
            customPMT,
            activePMT,
            projectedMonths,
            isOnTrack,
            deadlineDate,
            deadlineMonth,
            showBothLines,
            chartData,
            chartLength,
        };
    }, [selectedGoal, customContribution]);

    const formatYAxis = (val: number) => {
        if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
        if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}k`;
        return `$${val}`;
    };

    const projectedDate =
        calc && !calc.isComplete && calc.projectedMonths != null
            ? format(addMonths(new Date(), calc.projectedMonths), "MMM yyyy")
            : null;

    const STATS = calc && !calc.isComplete
        ? [
            {
                label: "Remaining",
                value: formatCurrency(calc.remaining),
                color: "text-slate-700",
                bg: "bg-slate-100",
                tip: "How much more you need to save to reach your goal.",
            },
            {
                label: "Required Monthly",
                value: calc.requiredPMT != null ? formatCurrency(calc.requiredPMT) : "—",
                color: "text-blue-600",
                bg: "bg-blue-50",
                tip: calc.requiredPMT != null
                    ? "Fixed monthly amount needed to hit your deadline exactly."
                    : "Set a deadline on your goal to see the required monthly amount.",
            },
            {
                label: "Reach Goal By",
                value: projectedDate ?? "—",
                color: calc.isOnTrack === false ? "text-amber-600" : "text-emerald-600",
                bg: calc.isOnTrack === false ? "bg-amber-50" : "bg-emerald-50",
                tip: "Projected date you'll reach your goal at the active contribution amount.",
            },
            {
                label: "Progress",
                value: `${calc.progressPct.toFixed(1)}%`,
                color: "text-violet-600",
                bg: "bg-violet-50",
                tip: "Your current savings as a percentage of the target amount.",
            },
        ]
        : [];

    return (
        <div className="max-w-screen-2xl mx-auto w-full pb-10">
            <Card className="border-none drop-shadow-md">
                <CardHeader>
                    <CardTitle className="text-xl">Savings Goal Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
                        {/* Left: inputs */}
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Select a Goal</label>
                                {isLoading ? (
                                    <Skeleton className="h-10 w-full" />
                                ) : (
                                    <Select value={selectedGoalId} onValueChange={(val) => { setSelectedGoalId(val); setCustomContribution(""); }}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a goal…" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {goals?.length === 0 && (
                                                <SelectItem value="__none__" disabled>
                                                    No goals yet — create one first
                                                </SelectItem>
                                            )}
                                            {goals?.map((g) => (
                                                <SelectItem key={g.id} value={g.id}>
                                                    {g.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium">
                                    Monthly Contribution{" "}
                                    <span className="text-muted-foreground font-normal">(optional)</span>
                                </label>
                                <CurrencyInput
                                    prefix="$"
                                    className={CURRENCY_INPUT_CLASS}
                                    value={customContribution}
                                    onValueChange={(val) => setCustomContribution(val || "")}
                                    placeholder={
                                        calc && !calc.isComplete && calc.requiredPMT != null
                                            ? `Required: ${formatCurrency(calc.requiredPMT)}/mo`
                                            : "Enter an amount to project"
                                    }
                                />
                                {calc && !calc.isComplete && calc.isOnTrack === false && (
                                    <p className="text-xs text-amber-600 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3 shrink-0" />
                                        Below the required amount — you&apos;ll miss your deadline.
                                    </p>
                                )}
                                {calc && !calc.isComplete && calc.isOnTrack === true && (
                                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3 shrink-0" />
                                        On track to beat your deadline.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Right: results */}
                        <div className="space-y-6">
                            {/* Empty state */}
                            {!selectedGoal && !isLoading && (
                                <div className="flex flex-col items-center justify-center h-full min-h-[360px] text-center gap-3 text-muted-foreground">
                                    <Target className="h-10 w-10 opacity-30" />
                                    <p className="text-sm">Select a goal from the left to see your savings projection.</p>
                                </div>
                            )}

                            {/* Complete state */}
                            {calc?.isComplete && (
                                <div className="flex flex-col items-center justify-center h-full min-h-[360px] text-center gap-3">
                                    <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                                    <p className="text-lg font-semibold">Goal reached!</p>
                                    <p className="text-sm text-muted-foreground">
                                        You&apos;ve already saved{" "}
                                        <span className="font-medium text-foreground">{formatCurrency(calc.current)}</span>
                                        {" "}— your target of{" "}
                                        <span className="font-medium text-foreground">{formatCurrency(calc.target)}</span> is met.
                                    </p>
                                </div>
                            )}

                            {/* Main results */}
                            {calc && !calc.isComplete && (
                                <>
                                    {/* Deadline passed banner */}
                                    {calc.isDeadlinePassed && (
                                        <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
                                            <AlertTriangle className="h-4 w-4 shrink-0" />
                                            Your deadline has passed. Update the goal&apos;s deadline to recalculate.
                                        </div>
                                    )}

                                    {/* Goal progress */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-muted-foreground">{selectedGoal?.name}</span>
                                            <span>
                                                <span className="font-semibold">{formatCurrency(calc.current)}</span>
                                                <span className="text-muted-foreground"> / {formatCurrency(calc.target)}</span>
                                            </span>
                                        </div>
                                        <Progress value={calc.progressPct} className="h-2.5" />
                                        {calc.deadlineDate && !calc.isDeadlinePassed && (
                                            <p className="text-xs text-muted-foreground text-right">
                                                Deadline: {format(calc.deadlineDate, "d MMM yyyy")}
                                            </p>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    <TooltipProvider delayDuration={200}>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {STATS.map(({ label, value, color, bg, tip }) => (
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

                                    {/* Chart */}
                                    <div className="h-[240px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={calc.chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="sgRequired" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                                                    </linearGradient>
                                                    <linearGradient id="sgCustom" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.7} />
                                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <XAxis
                                                    dataKey="label"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tick={{ fontSize: 11 }}
                                                    interval={Math.floor(calc.chartLength / 6)}
                                                />
                                                <YAxis
                                                    tickFormatter={formatYAxis}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tick={{ fontSize: 11 }}
                                                    width={58}
                                                />
                                                <ChartTooltip
                                                    formatter={(value, name) => [
                                                        formatCurrency(Number(value)),
                                                        name === "required"
                                                            ? (calc.showBothLines ? "Required rate" : "Projected balance")
                                                            : "Your rate",
                                                    ]}
                                                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: 13 }}
                                                />
                                                <ReferenceLine
                                                    y={Math.round(calc.target)}
                                                    stroke="#10b981"
                                                    strokeDasharray="4 3"
                                                    strokeWidth={1.5}
                                                    label={{ value: "Target", position: "insideTopRight", fontSize: 11, fill: "#10b981" }}
                                                />
                                                {calc.deadlineMonth !== null && !calc.isDeadlinePassed && (
                                                    <ReferenceLine
                                                        x={calc.chartData[calc.deadlineMonth]?.label}
                                                        stroke="#f43f5e"
                                                        strokeDasharray="4 3"
                                                        strokeWidth={1.5}
                                                        label={{ value: "Deadline", position: "insideTopLeft", fontSize: 11, fill: "#f43f5e" }}
                                                    />
                                                )}
                                                <Area
                                                    type="monotone"
                                                    dataKey="required"
                                                    stroke="#3b82f6"
                                                    fill="url(#sgRequired)"
                                                    strokeWidth={2}
                                                    dot={false}
                                                    name="required"
                                                />
                                                {calc.showBothLines && (
                                                    <Area
                                                        type="monotone"
                                                        dataKey="custom"
                                                        stroke="#f59e0b"
                                                        fill="url(#sgCustom)"
                                                        strokeWidth={2}
                                                        dot={false}
                                                        name="custom"
                                                    />
                                                )}
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Legend — only when comparing two scenarios */}
                                    {calc.showBothLines && (
                                        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-4 h-0.5 bg-blue-500 inline-block rounded" />
                                                Required ({formatCurrency(calc.requiredPMT!)}/mo)
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-4 h-0.5 bg-amber-400 inline-block rounded" />
                                                Your amount ({formatCurrency(calc.customPMT!)}/mo)
                                            </span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SavingsGoalPage;
