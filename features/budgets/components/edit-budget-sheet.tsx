import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { useSheet } from "@/hooks/use-sheet";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { useCreateCategory } from "@/features/categories/api/use-create-category";
import { useGetBudget } from "../api/use-get-budget";
import { useEditBudget } from "../api/use-edit-budget";
import { useDeleteBudget } from "../api/use-delete-budget";
import { useConfirm } from "@/hooks/use-confirm";
import { BudgetForm } from "./budget-form";
import { Loader2 } from "lucide-react";
import { convertAmountFromMiliUnits } from "@/lib/utils";

type Props = { id?: string };

export const EditBudgetSheet = ({ id }: Props) => {
    const { isOpen, onClose } = useSheet();

    const [ConfirmDialog, confirm] = useConfirm(
        "Are you sure?",
        "You are about to delete this budget. This action cannot be undone."
    );

    const budgetQuery = useGetBudget(id);
    const editMutation = useEditBudget(id);
    const deleteMutation = useDeleteBudget(id);

    const categoryQuery = useGetCategories();
    const categoryMutation = useCreateCategory();
    const onCreateCategory = (name: string) => categoryMutation.mutate({ name });
    const categoryOptions = (categoryQuery.data ?? []).map((c) => ({
        label: c.name,
        value: c.id,
    }));

    const isPending = editMutation.isPending || deleteMutation.isPending || categoryMutation.isPending;
    const isLoading = budgetQuery.isLoading || categoryQuery.isLoading;

    const onSubmit = (values: Parameters<typeof editMutation.mutate>[0]) => {
        editMutation.mutate(values, { onSuccess: () => onClose() });
    };

    const onDelete = async () => {
        const ok = await confirm();
        if (ok) deleteMutation.mutate(undefined, { onSuccess: () => onClose() });
    };

    const defaultValues = budgetQuery.data
        ? {
              categoryId: budgetQuery.data.categoryId ?? null,
              amount: convertAmountFromMiliUnits(budgetQuery.data.amount).toString(),
              period: (budgetQuery.data.period ?? "monthly") as "monthly" | "annual",
          }
        : { categoryId: null, amount: "", period: "monthly" as const };

    return (
        <>
            <ConfirmDialog />
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent className="space-y-4">
                    <SheetHeader>
                        <SheetTitle>Edit Budget</SheetTitle>
                        <SheetDescription>Update this budget allocation.</SheetDescription>
                    </SheetHeader>
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="size-4 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <BudgetForm
                            id={id}
                            onSubmit={onSubmit}
                            onDelete={onDelete}
                            disabled={isPending}
                            onCreateCategory={onCreateCategory}
                            categoryOptions={categoryOptions}
                            defaultValues={defaultValues}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
};
