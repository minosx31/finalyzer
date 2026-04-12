"use client";

import Link from "next/link";
import { Plus, Loader2, CreditCard, Building2, TrendingUp, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAccounts } from "@/features/accounts/api/index";
import { convertAmountFromMiliUnits, formatSGD } from "@/lib/utils";

const ACCOUNT_TYPE_ICONS: Record<string, React.ReactNode> = {
    checking: <Wallet className="size-5" />,
    savings: <Building2 className="size-5" />,
    credit: <CreditCard className="size-5" />,
    investment: <TrendingUp className="size-5" />,
    loan: <CreditCard className="size-5" />,
};

const ACCOUNT_TYPE_COLORS: Record<string, string> = {
    checking: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    savings: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    credit: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    investment: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    loan: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
};

const AccountsPage = () => {
    const { data: accounts, isLoading } = useGetAccounts();

    if (isLoading) {
        return (
            <div className="max-w-screen-2xl mx-auto w-full space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-9 w-28" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-36 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-screen-2xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Accounts</h1>
                <Button asChild size="sm">
                    <Link href="/manage/accounts/new">
                        <Plus className="size-4 mr-2" />
                        Add Account
                    </Link>
                </Button>
            </div>

            {(!accounts || accounts.length === 0) ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <Wallet className="size-10 text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">No accounts yet.</p>
                        <Button asChild size="sm" className="mt-4">
                            <Link href="/manage/accounts/new">Add your first account</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {accounts.map((account) => {
                        const type = account.type ?? "other";
                        const icon = ACCOUNT_TYPE_ICONS[type] ?? <Wallet className="size-5" />;
                        const colorClass = ACCOUNT_TYPE_COLORS[type] ?? "bg-gray-100 text-gray-700";
                        const balance = convertAmountFromMiliUnits(account.initialBalance ?? 0);

                        return (
                            <Link key={account.id} href={`/manage/accounts/${account.id}`}>
                                <Card className="hover:shadow-md transition-shadow cursor-pointer border">
                                    <CardHeader className="pb-2 flex-row items-center justify-between">
                                        <div className={`p-2 rounded-lg ${colorClass}`}>
                                            {icon}
                                        </div>
                                        <Badge variant="secondary" className="capitalize">
                                            {type}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="font-semibold text-lg truncate">{account.name}</p>
                                        <p className="text-2xl font-bold mt-1">
                                            {formatSGD(balance)}
                                        </p>
                                        {account.creditLimit && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Limit: {formatSGD(convertAmountFromMiliUnits(account.creditLimit))}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AccountsPage;
