import { createCrudHooks } from "@/lib/crud-hooks";

export type BudgetData = {
    id: string;
    categoryId: string | null;
    categoryName: string | null;
    amount: number;
    period: string;
};

export type BudgetInsert = {
    categoryId?: string | null;
    amount: number;
    period?: string;
};

export const {
    useGetAll: useGetBudgets,
    useGetOne: useGetBudget,
    useCreate: useCreateBudget,
    useEdit: useEditBudget,
    useDelete: useDeleteBudget,
    useBulkDelete: useBulkDeleteBudgets,
} = createCrudHooks<BudgetData, BudgetInsert>({
    entityName: "budget",
    path: "budgets",
    invalidateOnMutate: ["summary"],
});
