"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TransactionForm } from "@/features/transactions/components/transaction-form";
import { useCreateTransaction } from "@/features/transactions/api/index";
import { useGetAccounts, useCreateAccount } from "@/features/accounts/api/index";
import { useGetCategories, useCreateCategory } from "@/features/categories/api/index";

const NewTransactionPage = () => {
    const router = useRouter();
    const createTransaction = useCreateTransaction();
    const { data: accounts = [] } = useGetAccounts();
    const createAccount = useCreateAccount();
    const { data: categories = [] } = useGetCategories();
    const createCategory = useCreateCategory();

    const accountOptions = accounts.map((a) => ({ label: a.name, value: a.id }));
    const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id }));

    return (
        <div className="max-w-screen-sm mx-auto w-full space-y-4">
            <Button variant="ghost" size="sm" asChild>
                <Link href="/manage/transactions"><ArrowLeft className="size-4 mr-2" />Back to Transactions</Link>
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle>New Transaction</CardTitle>
                    <CardDescription>Record an income or expense.</CardDescription>
                </CardHeader>
                <CardContent>
                    <TransactionForm
                        onSubmit={(values) => createTransaction.mutate(values, {
                            onSuccess: () => router.push("/manage/transactions"),
                        })}
                        disabled={createTransaction.isPending}
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

export default NewTransactionPage;
