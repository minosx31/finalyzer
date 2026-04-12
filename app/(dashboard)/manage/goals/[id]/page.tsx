"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { GoalForm } from "@/features/goals/components/goal-form";
import { useGetGoal, useEditGoal, useDeleteGoal } from "@/features/goals/api/index";
import { useConfirm } from "@/hooks/use-confirm";
import { convertAmountFromMiliUnits, formatSGD } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

const GoalDetailPage = ({ params }: Props) => {
    const { id } = use(params);
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const { data: goal, isLoading } = useGetGoal(id);
    const editGoal = useEditGoal(id);
    const deleteGoal = useDeleteGoal(id);
    const [ConfirmDialog, confirm] = useConfirm("Delete Goal", "This goal will be permanently deleted.");

    if (isLoading) {
        return (
            <div className="max-w-screen-sm mx-auto w-full space-y-4">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-64 rounded-xl" />
            </div>
        );
    }

    if (!goal) return (
        <div className="max-w-screen-sm mx-auto w-full space-y-4">
            <Button variant="ghost" size="sm" asChild>
                <Link href="/manage/goals"><ArrowLeft className="size-4 mr-2" />Back</Link>
            </Button>
            <p className="text-muted-foreground">Goal not found.</p>
        </div>
    );

    const target = convertAmountFromMiliUnits(goal.targetAmount);
    const current = convertAmountFromMiliUnits(goal.currentAmount);
    const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
    const remaining = Math.max(0, target - current);

    const defaultFormValues = {
        name: goal.name,
        targetAmount: String(target),
        currentAmount: String(current),
        deadline: goal.deadline ? new Date(goal.deadline) : undefined,
    };

    const handleDelete = async () => {
        const ok = await confirm();
        if (ok) deleteGoal.mutate(undefined, { onSuccess: () => router.push("/manage/goals") });
    };

    return (
        <div className="max-w-screen-sm mx-auto w-full space-y-4">
            <ConfirmDialog />
            <Button variant="ghost" size="sm" asChild>
                <Link href="/manage/goals"><ArrowLeft className="size-4 mr-2" />Back to Goals</Link>
            </Button>
            <Card>
                <CardHeader className="flex-row items-start justify-between gap-4">
                    <CardTitle className="text-xl">{goal.name}</CardTitle>
                    <div className="flex gap-2 shrink-0">
                        {isEditing ? (
                            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}><X className="size-4" /></Button>
                        ) : (
                            <>
                                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}><Pencil className="size-4 mr-1" />Edit</Button>
                                <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleteGoal.isPending}
                                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
                                    <Trash2 className="size-4 mr-1" />Delete
                                </Button>
                            </>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <GoalForm
                            id={id}
                            defaultValues={defaultFormValues}
                            onSubmit={(values) => editGoal.mutate(values as Parameters<typeof editGoal.mutate>[0], {
                                onSuccess: () => setIsEditing(false),
                            })}
                            disabled={editGoal.isPending}
                        />
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Progress value={pct} className="h-3" />
                                <div className="flex justify-between text-sm">
                                    <span>{formatSGD(current)} saved</span>
                                    <span className="font-semibold">{formatSGD(target)} goal</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="p-3 rounded-lg bg-muted">
                                    <p className="text-muted-foreground text-xs">Progress</p>
                                    <p className="font-bold text-lg">{pct}%</p>
                                </div>
                                <div className="p-3 rounded-lg bg-muted">
                                    <p className="text-muted-foreground text-xs">Remaining</p>
                                    <p className="font-bold text-lg">{formatSGD(remaining)}</p>
                                </div>
                            </div>
                            {goal.deadline && (
                                <p className="text-sm text-muted-foreground">
                                    Target date: <span className="font-medium text-foreground">{format(new Date(goal.deadline), "MMMM d, yyyy")}</span>
                                </p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default GoalDetailPage;
