"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSheet } from "@/hooks/use-sheet";
import { Loader2, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table";
import { useGetBudgets } from "@/features/budgets/api/use-get-budgets";
import { columns } from "./columns";

const BudgetsPage = () => {
    const { onOpen } = useSheet();
    const budgetsQuery = useGetBudgets();
    const budgets = budgetsQuery.data ?? [];

    if (budgetsQuery.isLoading) {
        return (
            <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
                <Card className="border-none drop-shadow-md">
                    <CardHeader>
                        <Skeleton className="h-8 w-48" />
                    </CardHeader>
                    <CardContent>
                        <div className="h-[500px] w-full flex items-center justify-center">
                            <Loader2 className="size-6 text-slate-300 animate-spin" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
            <Card className="border-none drop-shadow-md">
                <CardHeader className="gap-y-2 md:flex-row md:items-center md:justify-between">
                    <CardTitle className="text-xl line-clamp-1">Budget Planner</CardTitle>
                    <Button size="sm" onClick={() => onOpen("new-budget")}>
                        <Plus className="size-4 mr-2" />
                        Add Budget
                    </Button>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={budgets}
                        filterKey="categoryName"
                        onDelete={() => {}}
                        disabled={budgetsQuery.isLoading}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default BudgetsPage;
