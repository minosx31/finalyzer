"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Pencil, Trash2, CreditCard, Building2, TrendingUp, Wallet, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { AccountForm } from "@/features/accounts/components/account-form";
import { useGetAccount, useEditAccount, useDeleteAccount } from "@/features/accounts/api/index";
import { useGetTransactions } from "@/features/transactions/api/index";
import { useConfirm } from "@/hooks/use-confirm";
import { convertAmountFromMiliUnits, formatSGD } from "@/lib/utils";

const ACCOUNT_TYPE_ICONS: Record<string, React.ReactNode> = {
    checking: <Wallet className="size-5" />,
    savings: <Building2 className="size-5" />,
    credit: <CreditCard className="size-5" />,
    investment: <TrendingUp className="size-5" />,
    loan: <CreditCard className="size-5" />,
};

type Props = {
    params: Promise<{ id: string }>;
};

const AccountDetailPage = ({ params }: Props) => {
    const { id } = use(params);
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);

    const { data: account, isLoading } = useGetAccount(id);
    const editAccount = useEditAccount(id);
    const deleteAccount = useDeleteAccount(id);
    const { data: transactions, isLoading: txLoading } = useGetTransactions({ limit: 10 });

    const [ConfirmDialog, confirm] = useConfirm(
        "Delete Account",
        "This will permanently delete this account and all its transactions. This cannot be undone.",
    );

    const accountTransactions = transactions?.filter((t) => t.accountId === id) ?? [];

    const handleEdit = (values: Parameters<typeof editAccount.mutate>[0]) => {
        editAccount.mutate(values, {
            onSuccess: () => setIsEditing(false),
        });
    };

    const handleDelete = async () => {
        const ok = await confirm();
        if (ok) {
            deleteAccount.mutate(undefined, {
                onSuccess: () => router.push("/manage/accounts"),
            });
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-screen-sm mx-auto w-full space-y-4">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-48 rounded-xl" />
                <Skeleton className="h-64 rounded-xl" />
            </div>
        );
    }

    if (!account) {
        return (
            <div className="max-w-screen-sm mx-auto w-full space-y-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/manage/accounts"><ArrowLeft className="size-4 mr-2" />Back</Link>
                </Button>
                <p className="text-muted-foreground">Account not found.</p>
            </div>
        );
    }

    const type = account.type ?? "other";
    const icon = ACCOUNT_TYPE_ICONS[type] ?? <Wallet className="size-5" />;
    const balance = convertAmountFromMiliUnits(account.initialBalance ?? 0);

    const defaultFormValues = {
        name: account.name,
        type: account.type ?? undefined,
        initialBalance: account.initialBalance ? String(convertAmountFromMiliUnits(account.initialBalance)) : undefined,
        creditLimit: account.creditLimit ? String(convertAmountFromMiliUnits(account.creditLimit)) : undefined,
        dueDate: account.dueDate ? String(account.dueDate) : undefined,
        interestRate: account.interestRate ? String(account.interestRate / 100) : undefined,
        currency: account.currency,
    };

    return (
        <div className="max-w-screen-sm mx-auto w-full space-y-4">
            <ConfirmDialog />

            <Button variant="ghost" size="sm" asChild>
                <Link href="/manage/accounts">
                    <ArrowLeft className="size-4 mr-2" />
                    Back to Accounts
                </Link>
            </Button>

            {/* Account card */}
            <Card>
                <CardHeader className="flex-row items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">{icon}</div>
                        <div>
                            <CardTitle className="text-xl">{account.name}</CardTitle>
                            <Badge variant="secondary" className="capitalize mt-1">{type}</Badge>
                        </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        {isEditing ? (
                            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                                <X className="size-4" />
                            </Button>
                        ) : (
                            <>
                                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                    <Pencil className="size-4 mr-1" />
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDelete}
                                    disabled={deleteAccount.isPending}
                                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                >
                                    <Trash2 className="size-4 mr-1" />
                                    Delete
                                </Button>
                            </>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <AccountForm
                            id={id}
                            defaultValues={defaultFormValues}
                            onSubmit={handleEdit}
                            disabled={editAccount.isPending}
                        />
                    ) : (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Opening Balance</span>
                                <span className="font-semibold text-lg">{formatSGD(balance)}</span>
                            </div>
                            {account.creditLimit && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Credit Limit</span>
                                    <span className="font-medium">{formatSGD(convertAmountFromMiliUnits(account.creditLimit))}</span>
                                </div>
                            )}
                            {account.interestRate && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Interest Rate</span>
                                    <span className="font-medium">{(account.interestRate / 100).toFixed(2)}%</span>
                                </div>
                            )}
                            {account.dueDate && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Payment Due</span>
                                    <span className="font-medium">Day {account.dueDate} of each month</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Currency</span>
                                <span className="font-medium">{account.currency}</span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recent transactions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Recent Transactions</CardTitle>
                    <CardDescription>Last 10 transactions for this account</CardDescription>
                </CardHeader>
                <CardContent>
                    {txLoading ? (
                        <div className="space-y-2">
                            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10" />)}
                        </div>
                    ) : accountTransactions.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No transactions yet.{" "}
                            <Link href="/manage/transactions" className="underline">Add one</Link>
                        </p>
                    ) : (
                        <div className="space-y-1">
                            {accountTransactions.map((tx, i) => (
                                <div key={tx.id}>
                                    {i > 0 && <Separator />}
                                    <div className="flex justify-between items-center py-2">
                                        <div>
                                            <p className="text-sm font-medium">{tx.payee}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(tx.date), "MMM d, yyyy")}
                                                {tx.category && ` · ${tx.category}`}
                                            </p>
                                        </div>
                                        <span className={`text-sm font-semibold ${tx.amount < 0 ? "text-red-500" : "text-green-600"}`}>
                                            {tx.amount < 0 ? "-" : "+"}{formatSGD(Math.abs(tx.amount))}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <Button variant="link" size="sm" className="mt-2 px-0" asChild>
                        <Link href={`/manage/transactions?accountId=${id}`}>
                            View all transactions →
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default AccountDetailPage;
