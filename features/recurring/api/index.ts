import { createCrudHooks } from "@/lib/crud-hooks";

export type RecurringExpenseData = {
    id: string;
    name: string;
    amount: number;
    frequency: string;
    startDate: string;
    categoryId: string | null;
    categoryName: string | null;
};

export type RecurringExpenseInsert = {
    name: string;
    amount: number;
    frequency: string;
    startDate: string | Date;
    categoryId?: string | null;
};

export const {
    useGetAll: useGetRecurringExpenses,
    useGetOne: useGetRecurringExpense,
    useCreate: useCreateRecurringExpense,
    useEdit: useEditRecurringExpense,
    useDelete: useDeleteRecurringExpense,
    useBulkDelete: useBulkDeleteRecurringExpenses,
} = createCrudHooks<RecurringExpenseData, RecurringExpenseInsert>({
    entityName: "recurring expense",
    path: "recurring",
    invalidateOnMutate: ["summary"],
});
