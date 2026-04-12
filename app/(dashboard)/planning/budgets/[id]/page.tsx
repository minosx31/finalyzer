"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BudgetForm } from "@/features/budgets/components/budget-form";
import { useGetBudget, useEditBudget, useDeleteBudget } from "@/features/budgets/api/index";
import { useGetCategories, useCreateCategory } from "@/features/categories/api/index";
import { useConfirm } from "@/hooks/use-confirm";
import { convertAmountFromMiliUnits, formatSGD } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

const BudgetDetailPage = ({ params }: Props) => {
    const { id } = use(params);
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const { data: budget, isLoading } = useGetBudget(id);
    const editBudget = useEditBudget(id);
    const deleteBudget = useDeleteBudget(id);
    const { data: categories = [] } = useGetCategories();
    const createCategory = useCreateCategory();
    const [ConfirmDialog, confirm] = useConfirm("Delete Budget", "This budget will be permanently deleted.");

    const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id }));

    if (isLoading) return (
        <div className="max-w-screen-sm mx-auto w-full space-y-4">
            <Skeleton className="h-8 w-32" /><Skeleton className="h-48 rounded-xl" />
        </div>
    );

    if (!budget) return (
        <div className="max-w-screen-sm mx-auto w-full space-y-4">
            <Button variant="ghost" size="sm" asChild>
                <Link href="/planning/budgets"><ArrowLeft className="size-4 mr-2" />Back</Link>
            </Button>
            <p className="text-muted-foreground">Budget not found.</p>
        </div>
    );

    const handleDelete = async () => {
        const ok = await confirm();
        if (ok) deleteBudget.mutate(undefined, { onSuccess: () => router.push("/planning/budgets") });
    };

    const defaultFormValues = {
        categoryId: budget.categoryId ?? null,
        amount: String(convertAmountFromMiliUnits(budget.amount)),
        period: budget.period as "monthly" | "annual",
    };

    return (
        <div className="max-w-screen-sm mx-auto w-full space-y-4">
            <ConfirmDialog />
            <Button variant="ghost" size="sm" asChild>
                <Link href="/planning/budgets"><ArrowLeft className="size-4 mr-2" />Back to Budgets</Link>
            </Button>
            <Card>
                <CardHeader className="flex-row items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-xl">{budget.categoryName ?? "Overall Budget"}</CardTitle>
                        <p className="text-sm text-muted-foreground capitalize mt-1">{budget.period}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        {isEditing ? (
                            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}><X className="size-4" /></Button>
                        ) : (
                            <>
                                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}><Pencil className="size-4 mr-1" />Edit</Button>
                                <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleteBudget.isPending}
                                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
                                    <Trash2 className="size-4 mr-1" />Delete
                                </Button>
                            </>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <BudgetForm
                            id={id}
                            defaultValues={defaultFormValues}
                            onSubmit={(values) => editBudget.mutate(values as Parameters<typeof editBudget.mutate>[0], { onSuccess: () => setIsEditing(false) })}
                            disabled={editBudget.isPending}
                            categoryOptions={categoryOptions}
                            onCreateCategory={(name) => createCategory.mutate({ name })}
                        />
                    ) : (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Budget Limit</span>
                                <span className="font-bold text-xl">{formatSGD(convertAmountFromMiliUnits(budget.amount))}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Period</span>
                                <span className="font-medium capitalize">{budget.period}</span>
                            </div>
                            {budget.categoryName && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Category</span>
                                    <span className="font-medium">{budget.categoryName}</span>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default BudgetDetailPage;
