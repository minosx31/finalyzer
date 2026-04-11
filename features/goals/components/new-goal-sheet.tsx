import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { useSheet } from "@/hooks/use-sheet";
import { GoalForm } from "@/features/goals/components/goal-form";
import { insertGoalSchema } from "@/db/schema";
import { z } from "zod";
import { useCreateGoal } from "../api/use-create-goal";

// No local schema needed as we rely on GoalForm internal validation but we can define the submit type
const formSchema = insertGoalSchema.pick({
    name: true,
    targetAmount: true,
    currentAmount: true,
    deadline: true,
});

type FormValues = z.input<typeof formSchema>;

export const NewGoalSheet = () => {
    const { isOpen, onClose } = useSheet();

    const mutation = useCreateGoal();

    const onSubmit = (values: FormValues) => {
        mutation.mutate(values, {
            onSuccess: () => {
                onClose();
            }
        });
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="space-y-4">
                <SheetHeader>
                    <SheetTitle>New Goal</SheetTitle>
                    <SheetDescription>
                        Create a new financial goal to track your progress.
                    </SheetDescription>
                </SheetHeader>
                <GoalForm
                    onSubmit={onSubmit}
                    disabled={mutation.isPending}
                    defaultValues={{
                        name: "",
                        targetAmount: "",
                        currentAmount: "",
                    }}
                />
            </SheetContent>
        </Sheet>
    )
}
