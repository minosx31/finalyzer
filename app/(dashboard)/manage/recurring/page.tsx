"use client";

import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetRecurringExpenses } from "@/features/recurring/api/index";
import { convertAmountFromMiliUnits, formatSGD } from "@/lib/utils";

const RecurringPage = () => {
    const { data: recurring, isLoading } = useGetRecurringExpenses();

    if (isLoading) {
        return (
            <div className="max-w-screen-2xl mx-auto w-full space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-9 w-32" />
                </div>
                <div className="space-y-2">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-screen-2xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Recurring Expenses</h1>
                <Button asChild size="sm">
                    <Link href="/manage/recurring/new">
                        <Plus className="size-4 mr-2" />
                        Add Recurring
                    </Link>
                </Button>
            </div>

            {(!recurring || recurring.length === 0) ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <RefreshCw className="size-10 text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">No recurring expenses yet.</p>
                        <Button asChild size="sm" className="mt-4">
                            <Link href="/manage/recurring/new">Add your first recurring expense</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    {recurring.map((item) => (
                        <Link key={item.id} href={`/manage/recurring/${item.id}`}>
                            <div className="flex items-center justify-between px-4 py-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <RefreshCw className="size-4 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        {item.categoryName && (
                                            <p className="text-xs text-muted-foreground">{item.categoryName}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant="secondary" className="capitalize">{item.frequency}</Badge>
                                    <span className="font-semibold">{formatSGD(convertAmountFromMiliUnits(item.amount))}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecurringPage;
