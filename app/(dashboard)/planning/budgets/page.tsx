"use client";

import Link from "next/link";
import { Plus, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetBudgets } from "@/features/budgets/api/index";
import { convertAmountFromMiliUnits, formatSGD } from "@/lib/utils";

const BudgetsPage = () => {
    const { data: budgets, isLoading } = useGetBudgets();

    if (isLoading) {
        return (
            <div className="max-w-screen-2xl mx-auto w-full space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-9 w-28" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-screen-2xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Budgets</h1>
                <Button asChild size="sm">
                    <Link href="/planning/budgets/new">
                        <Plus className="size-4 mr-2" />
                        Add Budget
                    </Link>
                </Button>
            </div>

            {(!budgets || budgets.length === 0) ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <PiggyBank className="size-10 text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">No budgets yet.</p>
                        <Button asChild size="sm" className="mt-4">
                            <Link href="/planning/budgets/new">Add your first budget</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {budgets.map((budget) => {
                        const amount = convertAmountFromMiliUnits(budget.amount);
                        return (
                            <Link key={budget.id} href={`/planning/budgets/${budget.id}`}>
                                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">
                                            {budget.categoryName ?? "Overall"}
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground capitalize">{budget.period}</p>
                                    </CardHeader>
                                    <CardContent>
                                        <Progress value={0} className="h-2 mb-2" />
                                        <p className="text-lg font-bold">{formatSGD(amount)}</p>
                                        <p className="text-xs text-muted-foreground">budget limit</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default BudgetsPage;
