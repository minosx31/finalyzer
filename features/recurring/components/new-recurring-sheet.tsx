import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { useSheet } from "@/hooks/use-sheet";
import { RecurringForm } from "@/features/recurring/components/recurring-form";
import { insertRecurringExpenseSchema } from "@/db/schema";
import { z } from "zod";
import { useCreateRecurringExpense } from "../api/use-create-recurring-expense";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { useCreateCategory } from "@/features/categories/api/use-create-category";
import { Loader2 } from "lucide-react";

// Use same schema keys as form
const formSchema = insertRecurringExpenseSchema.pick({
    name: true,
    amount: true,
    frequency: true,
    startDate: true,
    categoryId: true,
});

type FormValues = z.input<typeof formSchema>;

export const NewRecurringSheet = () => {
    const { isOpen, onClose } = useSheet();

    const mutation = useCreateRecurringExpense();

    // Categories integration
    const categoriesQuery = useGetCategories();
    const categoryMutation = useCreateCategory();
    const onCreateCategory = (name: string) => categoryMutation.mutate({
        name
    });
    const categoryOptions = (categoriesQuery.data ?? []).map((category) => ({
        label: category.name,
        value: category.id,
    }));

    const isPending = mutation.isPending || categoryMutation.isPending;
    const isLoading = categoriesQuery.isLoading;

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
                    <SheetTitle>New Recurring Expense</SheetTitle>
                    <SheetDescription>
                        Track a new subscription or recurring bill.
                    </SheetDescription>
                </SheetHeader>
                {isLoading ? (
                     <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="size-4 text-muted-foreground animate-spin" />
                    </div>
                ) : (
                    <RecurringForm
                        onSubmit={onSubmit}
                        disabled={isPending}
                        categoryOptions={categoryOptions}
                        onCreateCategory={onCreateCategory}
                        defaultValues={{
                            name: "",
                            amount: "",
                            frequency: "",
                            startDate: new Date(),
                            categoryId: "",
                        }}
                    />
                )}
            </SheetContent>
        </Sheet>
    )
}
