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
import { useCreateBudget } from "../api/use-create-budget";
import { BudgetForm } from "./budget-form";
import { Loader2 } from "lucide-react";

export const NewBudgetSheet = () => {
    const { isOpen, onClose } = useSheet();
    const mutation = useCreateBudget();

    const categoryQuery = useGetCategories();
    const categoryMutation = useCreateCategory();
    const onCreateCategory = (name: string) => categoryMutation.mutate({ name });
    const categoryOptions = (categoryQuery.data ?? []).map((c) => ({
        label: c.name,
        value: c.id,
    }));

    const isLoading = categoryQuery.isLoading;
    const isPending = mutation.isPending || categoryMutation.isPending;

    const onSubmit = (values: Parameters<typeof mutation.mutate>[0]) => {
        mutation.mutate(values, { onSuccess: () => onClose() });
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="space-y-4">
                <SheetHeader>
                    <SheetTitle>New Budget</SheetTitle>
                    <SheetDescription>Set a spending budget for a category.</SheetDescription>
                </SheetHeader>
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <BudgetForm
                        onSubmit={onSubmit}
                        disabled={isPending}
                        onCreateCategory={onCreateCategory}
                        categoryOptions={categoryOptions}
                        defaultValues={{ categoryId: null, amount: "", period: "monthly" }}
                    />
                )}
            </SheetContent>
        </Sheet>
    );
};
