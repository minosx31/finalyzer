"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GoalForm } from "@/features/goals/components/goal-form";
import { useCreateGoal } from "@/features/goals/api/index";

const NewGoalPage = () => {
    const router = useRouter();
    const createGoal = useCreateGoal();

    return (
        <div className="max-w-screen-sm mx-auto w-full space-y-4">
            <Button variant="ghost" size="sm" asChild>
                <Link href="/manage/goals"><ArrowLeft className="size-4 mr-2" />Back to Goals</Link>
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle>New Goal</CardTitle>
                    <CardDescription>Set a savings goal with a target amount and deadline.</CardDescription>
                </CardHeader>
                <CardContent>
                    <GoalForm
                        onSubmit={(values) => createGoal.mutate(values as Parameters<typeof createGoal.mutate>[0], {
                            onSuccess: () => router.push("/manage/goals"),
                        })}
                        disabled={createGoal.isPending}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default NewGoalPage;
