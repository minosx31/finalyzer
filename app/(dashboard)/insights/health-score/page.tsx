"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Loader2, HeartPulse, CheckCircle2, AlertTriangle, XCircle, Info, ArrowRight } from "lucide-react";
import Link from "next/link";

import { useGetProfile } from "@/features/profile/api/use-get-profile";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { useGetEmergencyFund } from "@/features/emergency-fund/api/use-get-emergency-fund";
import { useGetGoals } from "@/features/goals/api/use-get-goals";
import { useMarkHealthCheck } from "@/features/profile/api/use-mark-health-check";
import { computeHealthScore, type HealthScoreInput } from "@/lib/financial-health";

// Grade display config
const GRADE_CONFIG: Record<string, { color: string; bg: string; border: string; ring: string }> = {
    A: { color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", ring: "ring-emerald-300" },
    B: { color: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-200",    ring: "ring-blue-300" },
    C: { color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200",   ring: "ring-amber-300" },
    D: { color: "text-orange-700",  bg: "bg-orange-50",  border: "border-orange-200",  ring: "ring-orange-300" },
    F: { color: "text-rose-700",    bg: "bg-rose-50",    border: "border-rose-200",    ring: "ring-rose-300" },
};

const STATUS_ICONS = {
    good: CheckCircle2,
    fair: AlertTriangle,
    poor: XCircle,
} as const;

const STATUS_COLORS = {
    good: "text-emerald-600",
    fair: "text-amber-600",
    poor: "text-rose-600",
} as const;

const STATUS_BADGE_CLASSES = {
    good: "bg-emerald-50 text-emerald-700 border-emerald-200",
    fair: "bg-amber-50 text-amber-700 border-amber-200",
    poor: "bg-rose-50 text-rose-700 border-rose-200",
} as const;

const POOR_RECOMMENDATIONS: Record<string, { text: string; href: string; linkText: string }> = {
    "Savings Rate": {
        text: "Try to save at least 20% of your monthly income. Review your spending categories to find areas to cut back.",
        href: "/planning/budgets",
        linkText: "Set a budget",
    },
    "Emergency Fund": {
        text: "Build up 3–6 months of living expenses in an accessible savings account as a safety net.",
        href: "/planning/emergency-fund",
        linkText: "Update emergency fund",
    },
    "Credit Utilization": {
        text: "Keep credit card balances below 30% of your total credit limit to maintain a healthy credit profile.",
        href: "/planning/debt-planner",
        linkText: "Plan debt payoff",
    },
    "Goal Progress": {
        text: "Revisit your financial goals and consider allocating more toward them each month.",
        href: "/manage/goals",
        linkText: "Review goals",
    },
    "Debt-to-Income": {
        text: "Work on reducing monthly debt payments to below 36% of your income. Consider the avalanche or snowball strategy.",
        href: "/planning/debt-planner",
        linkText: "Open debt planner",
    },
};

const HealthScorePage = () => {
    const profileQuery = useGetProfile();
    const accountsQuery = useGetAccounts();
    const emergencyFundQuery = useGetEmergencyFund();
    const goalsQuery = useGetGoals();
    const markHealthCheck = useMarkHealthCheck();

    // Mark health check once on mount
    const marked = useRef(false);
    useEffect(() => {
        if (!marked.current) {
            marked.current = true;
            markHealthCheck.mutate();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isLoading =
        profileQuery.isLoading ||
        accountsQuery.isLoading ||
        emergencyFundQuery.isLoading ||
        goalsQuery.isLoading;

    if (isLoading) {
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

    const profile = profileQuery.data;
    const accounts = accountsQuery.data ?? [];
    const emergencyData = emergencyFundQuery.data;
    const goals = goalsQuery.data ?? [];

    // Assemble health score input — all monetary values must be in milliunits
    const creditAccounts = accounts.filter((a) => a.type === "credit");
    const totalCreditLimit = creditAccounts.reduce((s, a) => s + (a.creditLimit ?? 0), 0);
    const totalCreditBalance = creditAccounts.reduce((s, a) => {
        const b = a.balance ?? 0;
        return s + (b < 0 ? Math.abs(b) : 0);
    }, 0);

    const avgGoalCompletion = goals.length > 0
        ? goals.reduce((s, g) => {
            const pct = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
            return s + Math.min(100, pct);
        }, 0) / goals.length
        : 0;

    const fund = emergencyData?.fund;
    const avgMonthlyExpenses = emergencyData?.avgMonthlyExpenses ?? 0;
    const emergencyFundCurrent = fund?.currentAmount ?? 0;
    const emergencyFundTarget = fund ? fund.targetMonths * avgMonthlyExpenses : 0;

    // Estimate monthly debt payments as 2% of outstanding credit balances
    const monthlyDebtPayments = Math.round(totalCreditBalance * 0.02);

    const monthlyIncome = profile?.monthlyIncome ?? 0;
    const monthlyExpenses = avgMonthlyExpenses; // from emergency fund endpoint (last 3 months avg)

    const hasEnoughData = monthlyIncome > 0 || totalCreditLimit > 0 || emergencyFundCurrent > 0 || goals.length > 0;

    const input: HealthScoreInput = {
        monthlyIncome,
        monthlyExpenses,
        totalCreditLimit,
        totalCreditBalance,
        emergencyFundCurrent,
        emergencyFundTarget,
        avgGoalCompletion,
        monthlyDebtPayments,
    };

    const result = computeHealthScore(input);
    const gradeConfig = GRADE_CONFIG[result.grade];
    const poorFactors = result.factors.filter((f) => f.status === "poor");

    return (
        <div className="max-w-screen-2xl mx-auto w-full pb-10">
            <Card className="border-none drop-shadow-md">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <HeartPulse className="size-5 text-muted-foreground" />
                        <CardTitle className="text-xl">Financial Health Score</CardTitle>
                    </div>
                    <CardDescription>
                        A weighted score across 5 factors: savings rate, emergency fund, credit utilization,
                        goal progress, and debt-to-income ratio.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {!hasEnoughData && (
                        <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                            <Info className="size-4 shrink-0" />
                            Complete your{" "}
                            <Link href="/personal/profile" className="underline underline-offset-2">profile</Link>
                            {" "}and add some financial data for an accurate score.
                        </div>
                    )}

                    {/* Score card */}
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className={`flex-shrink-0 flex items-center justify-center w-32 h-32 rounded-full ring-4 ${gradeConfig.ring} ${gradeConfig.bg} ${gradeConfig.border} border-2`}>
                            <div className="text-center">
                                <p className={`text-5xl font-black leading-none ${gradeConfig.color}`}>{result.grade}</p>
                                <p className={`text-sm font-bold mt-1 ${gradeConfig.color}`}>{result.totalScore}/100</p>
                            </div>
                        </div>
                        <div className="space-y-2 flex-1 w-full">
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-bold">{result.label}</p>
                                <Badge variant="outline" className={`${gradeConfig.color} ${gradeConfig.border}`}>
                                    Grade {result.grade}
                                </Badge>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Score</span>
                                    <span>{result.totalScore} / 100</span>
                                </div>
                                <Progress value={result.totalScore} className="h-3" />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span className="text-rose-500">0 — Critical</span>
                                    <span className="text-amber-500">55 — Fair</span>
                                    <span className="text-emerald-500">85 — Excellent</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Factor breakdown */}
                    <div className="space-y-4">
                        <p className="text-sm font-semibold">Factor Breakdown</p>
                        <div className="space-y-3">
                            {result.factors.map((factor) => {
                                const StatusIcon = STATUS_ICONS[factor.status];
                                return (
                                    <div key={factor.name} className="rounded-md border p-4 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <StatusIcon className={`size-4 ${STATUS_COLORS[factor.status]}`} />
                                                <p className="font-medium text-sm">{factor.name}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={`text-xs ${STATUS_BADGE_CLASSES[factor.status]}`}>
                                                    {factor.status}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground w-14 text-right">
                                                    {factor.score}/100 × {(factor.weight * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                        </div>
                                        <Progress value={factor.score} className="h-1.5" />
                                        <p className="text-xs text-muted-foreground">{factor.detail}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recommendations */}
                    {poorFactors.length > 0 && (
                        <>
                            <Separator />
                            <div className="space-y-3">
                                <p className="text-sm font-semibold">Recommendations</p>
                                <div className="space-y-2">
                                    {poorFactors.map((factor) => {
                                        const rec = POOR_RECOMMENDATIONS[factor.name];
                                        if (!rec) return null;
                                        return (
                                            <div key={factor.name} className="rounded-md border border-rose-100 bg-rose-50/50 px-4 py-3 space-y-1">
                                                <div className="flex items-center gap-1.5 text-sm font-medium text-rose-700">
                                                    <XCircle className="size-3.5" />
                                                    {factor.name}
                                                </div>
                                                <p className="text-xs text-muted-foreground">{rec.text}</p>
                                                <Link
                                                    href={rec.href}
                                                    className="inline-flex items-center gap-1 text-xs text-blue-600 underline underline-offset-2 mt-0.5"
                                                >
                                                    {rec.linkText} <ArrowRight className="size-3" />
                                                </Link>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}

                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Info className="size-3 shrink-0" />
                        Score updates each time you visit this page. Visiting also marks your monthly health check as done.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default HealthScorePage;
