import { createCrudHooks } from "@/lib/crud-hooks";

export type AccountData = {
    id: string;
    name: string;
    type: string | null;
    initialBalance: number | null;
    creditLimit: number | null;
    dueDate: number | null;
    interestRate: number | null;
    currency: string;
};

export type AccountInsert = {
    name: string;
    type?: string | null;
    initialBalance?: number | null;
    creditLimit?: number | null;
    dueDate?: number | null;
    interestRate?: number | null;
    currency?: string;
};

export const {
    useGetAll: useGetAccounts,
    useGetOne: useGetAccount,
    useCreate: useCreateAccount,
    useEdit: useEditAccount,
    useDelete: useDeleteAccount,
    useBulkDelete: useBulkDeleteAccounts,
} = createCrudHooks<AccountData, AccountInsert>({
    entityName: "account",
    path: "accounts",
    invalidateOnMutate: ["transactions", "summary"],
});
