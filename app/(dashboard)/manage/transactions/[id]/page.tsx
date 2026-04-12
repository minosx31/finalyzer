"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionForm } from "@/features/transactions/components/transaction-form";
import { useGetTransaction, useEditTransaction, useDeleteTransaction } from "@/features/transactions/api/index";
import { useGetAccounts, useCreateAccount } from "@/features/accounts/api/index";
import { useGetCategories, useCreateCategory } from "@/features/categories/api/index";
import { useConfirm } from "@/hooks/use-confirm";

type Props = { params: Promise<{ id: string }> };

const TransactionDetailPage = ({ params }: Props) => {
    const { id } = use(params);
    const router = useRouter();
    const { data: transaction, isLoading } = useGetTransaction(id);
    const editTransaction = useEditTransaction(id);
    const deleteTransaction = useDeleteTransaction(id);
    const { data: accounts = [] } = useGetAccounts();
    const createAccount = useCreateAccount();
    const { data: categories = [] } = useGetCategories();
    const createCategory = useCreateCategory();
    const [ConfirmDialog, confirm] = useConfirm("Delete Transaction", "This transaction will be permanently deleted.");

    const accountOptions = accounts.map((a) => ({ label: a.name, value: a.id }));
    const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id }));

    if (isLoading) return (
        <div className="max-w-screen-sm mx-auto w-full space-y-4">
            <Skeleton className="h-8 w-32" /><Skeleton className="h-72 rounded-xl" />
        </div>
    );

    if (!transaction) return (
        <div className="max-w-screen-sm mx-auto w-full space-y-4">
            <Button variant="ghost" size="sm" asChild>
                <Link href="/manage/transactions"><ArrowLeft className="size-4 mr-2" />Back</Link>
            </Button>
            <p className="text-muted-foreground">Transaction not found.</p>
        </div>
    );

    const handleDelete = async () => {
        const ok = await confirm();
        if (ok) deleteTransaction.mutate(undefined, { onSuccess: () => router.push("/manage/transactions") });
    };

    const defaultValues = {
        date: transaction.date ? new Date(transaction.date) : new Date(),
        accountId: transaction.accountId,
        categoryId: transaction.categoryId ?? null,
        payee: transaction.payee,
        amount: String(transaction.amount),
        notes: transaction.notes ?? null,
    };

    return (
        <div className="max-w-screen-sm mx-auto w-full space-y-4">
            <ConfirmDialog />
            <Button variant="ghost" size="sm" asChild>
                <Link href="/manage/transactions"><ArrowLeft className="size-4 mr-2" />Back to Transactions</Link>
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Edit Transaction</CardTitle>
                </CardHeader>
                <CardContent>
                    <TransactionForm
                        id={id}
                        defaultValues={defaultValues}
                        onSubmit={(values) => editTransaction.mutate(values, {
                            onSuccess: () => router.push("/manage/transactions"),
                        })}
                        onDelete={handleDelete}
                        disabled={editTransaction.isPending || deleteTransaction.isPending}
                        accountOptions={accountOptions}
                        categoryOptions={categoryOptions}
                        onCreateAccount={(name) => createAccount.mutate({ name })}
                        onCreateCategory={(name) => createCategory.mutate({ name })}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default TransactionDetailPage;
