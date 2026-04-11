import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { RecurringForm } from "@/features/recurring/components/recurring-form";
import { useGetRecurringExpense } from "@/features/recurring/api/use-get-recurring-expense";
import { useEditRecurringExpense } from "@/features/recurring/api/use-edit-recurring-expense";
import { useDeleteRecurringExpense } from "@/features/recurring/api/use-delete-recurring-expense";
import { useSheet } from "@/hooks/use-sheet";
import { Loader2 } from "lucide-react";
import { useConfirm } from "@/hooks/use-confirm";
import { convertAmountFromMiliUnits } from "@/lib/utils";
import { insertRecurringExpenseSchema } from "@/db/schema";
import { z } from "zod";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { useCreateCategory } from "@/features/categories/api/use-create-category";

const formSchema = insertRecurringExpenseSchema.pick({
    name: true,
    amount: true,
    frequency: true,
    startDate: true,
    categoryId: true,
});

type FormValues = z.input<typeof formSchema>;

type Props = {
    id?: string;
};

export const EditRecurringSheet = ({ id }: Props) => {
    const { isOpen, onClose } = useSheet();

    const [ConfirmDialog, confirm] = useConfirm(
        "Are you sure?",
        "You are about to delete this recurring expense. This action cannot be undone."
    );
    
    const recurringQuery = useGetRecurringExpense(id);
    const editMutation = useEditRecurringExpense(id);
    const deleteMutation = useDeleteRecurringExpense(id);

    // Categories
    const categoriesQuery = useGetCategories();
    const categoryMutation = useCreateCategory();
    const onCreateCategory = (name: string) => categoryMutation.mutate({
        name
    });
    const categoryOptions = (categoriesQuery.data ?? []).map((category) => ({
        label: category.name,
        value: category.id,
    }));


    const isPending = editMutation.isPending || deleteMutation.isPending || categoryMutation.isPending;
    const isLoading = recurringQuery.isLoading || categoriesQuery.isLoading;

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

    const defaultValues = recurringQuery.data ? {
        name: recurringQuery.data.name,
        amount: convertAmountFromMiliUnits(recurringQuery.data.amount).toString(),
        frequency: recurringQuery.data.frequency,
        startDate: recurringQuery.data.startDate ? new Date(recurringQuery.data.startDate) : new Date(),
        categoryId: recurringQuery.data.categoryId || "",
    } : {
        name: "",
        amount: "",
        frequency: "",
        startDate: new Date(),
        categoryId: "", 
    };

    return (
        <>
            <ConfirmDialog />
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent className="space-y-4">
                    <SheetHeader>
                        <SheetTitle>Edit Recurring Expense</SheetTitle>
                        <SheetDescription>
                            Edit your recurring expense details.
                        </SheetDescription>
                    </SheetHeader>
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="size-4 text-muted-foreground animate-spin" />
                        </div>
                    ) : (
                        <RecurringForm
                            id={id}
                            onSubmit={onSubmit}
                            disabled={isPending}
                            defaultValues={defaultValues}
                            onDelete={onDelete}
                            categoryOptions={categoryOptions}
                            onCreateCategory={onCreateCategory}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </>
    )
}
