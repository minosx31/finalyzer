import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { GoalForm } from "@/features/goals/components/goal-form";
import { useGetGoal } from "@/features/goals/api/use-get-goal";
import { useEditGoal } from "@/features/goals/api/use-edit-goal";
import { useDeleteGoal } from "@/features/goals/api/use-delete-goal";
import { useSheet } from "@/hooks/use-sheet";
import { Loader2 } from "lucide-react";
import { useConfirm } from "@/hooks/use-confirm";
import { convertAmountFromMiliUnits } from "@/lib/utils";
import { insertGoalSchema } from "@/db/schema";
import { z } from "zod";

const formSchema = insertGoalSchema.pick({
    name: true,
    targetAmount: true,
    currentAmount: true,
    deadline: true,
});

type FormValues = z.input<typeof formSchema>;

type Props = {
    id?: string;
};

export const EditGoalSheet = ({ id }: Props) => {
    const { isOpen, onClose } = useSheet();

    const [ConfirmDialog, confirm] = useConfirm(
        "Are you sure?",
        "You are about to delete this goal. This action cannot be undone."
    );
    
    const goalQuery = useGetGoal(id);

    const editMutation = useEditGoal(id);
    const deleteMutation = useDeleteGoal(id);

    const isPending = editMutation.isPending || deleteMutation.isPending;
    const isLoading = goalQuery.isLoading;

    const onSubmit = (values: FormValues) => {
        editMutation.mutate(values, {
            onSuccess: () => {
                onClose();
            }
        });
    };

    const onDelete = async () => {
        const ok = await confirm();
        if (ok) {
            deleteMutation.mutate(undefined, {
                onSuccess: () => {
                    onClose();
                }
            });
        }
    }

    const defaultValues = goalQuery.data ? {
        name: goalQuery.data.name,
        targetAmount: convertAmountFromMiliUnits(goalQuery.data.targetAmount).toString(),
        currentAmount: convertAmountFromMiliUnits(goalQuery.data.currentAmount).toString(),
        deadline: goalQuery.data.deadline ? new Date(goalQuery.data.deadline) : undefined,
    } : {
        name: "",
        targetAmount: "",
        currentAmount: "",
        deadline: undefined, 
    };

    return (
        <>
            <ConfirmDialog />
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent className="space-y-4">
                    <SheetHeader>
                        <SheetTitle>Edit Goal</SheetTitle>
                        <SheetDescription>
                            Edit your financial goal details.
                        </SheetDescription>
                    </SheetHeader>
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="size-4 text-muted-foreground animate-spin" />
                        </div>
                    ) : (
                        <GoalForm
                            id={id}
                            onSubmit={onSubmit}
                            disabled={isPending}
                            defaultValues={defaultValues}
                            onDelete={onDelete}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </>
    )
}
