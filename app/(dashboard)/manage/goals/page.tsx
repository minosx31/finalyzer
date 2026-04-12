"use client";

import Link from "next/link";
import { Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useGetGoals } from "@/features/goals/api/index";
import { convertAmountFromMiliUnits, formatSGD } from "@/lib/utils";
import { format } from "date-fns";

const GoalsPage = () => {
    const { data: goals, isLoading } = useGetGoals();

    if (isLoading) {
        return (
            <div className="max-w-screen-2xl mx-auto w-full space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-9 w-28" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-screen-2xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Goals</h1>
                <Button asChild size="sm">
                    <Link href="/manage/goals/new">
                        <Plus className="size-4 mr-2" />
                        Add Goal
                    </Link>
                </Button>
            </div>

            {(!goals || goals.length === 0) ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <Target className="size-10 text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">No goals yet.</p>
                        <Button asChild size="sm" className="mt-4">
                            <Link href="/manage/goals/new">Add your first goal</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {goals.map((goal) => {
                        const target = convertAmountFromMiliUnits(goal.targetAmount);
                        const current = convertAmountFromMiliUnits(goal.currentAmount);
                        const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
                        return (
                            <Link key={goal.id} href={`/manage/goals/${goal.id}`}>
                                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base truncate">{goal.name}</CardTitle>
                                        {goal.deadline && (
                                            <p className="text-xs text-muted-foreground">
                                                By {format(new Date(goal.deadline), "MMM yyyy")}
                                            </p>
                                        )}
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <Progress value={pct} className="h-2" />
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">{formatSGD(current)}</span>
                                            <span className="font-medium">{formatSGD(target)}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground text-right">{pct}% complete</p>
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

export default GoalsPage;
