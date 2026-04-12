"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RecurringForm } from "@/features/recurring/components/recurring-form";
import { useGetRecurringExpense, useEditRecurringExpense, useDeleteRecurringExpense } from "@/features/recurring/api/index";
import { useGetCategories, useCreateCategory } from "@/features/categories/api/index";
import { useConfirm } from "@/hooks/use-confirm";
import { convertAmountFromMiliUnits, formatSGD } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

const RecurringDetailPage = ({ params }: Props) => {
    const { id } = use(params);
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const { data: recurring, isLoading } = useGetRecurringExpense(id);
    const editRecurring = useEditRecurringExpense(id);
    const deleteRecurring = useDeleteRecurringExpense(id);
    const { data: categories = [] } = useGetCategories();
    const createCategory = useCreateCategory();
    const [ConfirmDialog, confirm] = useConfirm("Delete Recurring Expense", "This recurring expense will be permanently deleted.");

    const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id }));

    if (isLoading) return (
        <div className="max-w-screen-sm mx-auto w-full space-y-4">
            <Skeleton className="h-8 w-32" /><Skeleton className="h-48 rounded-xl" />
        </div>
    );

    if (!recurring) return (
        <div className="max-w-screen-sm mx-auto w-full space-y-4">
            <Button variant="ghost" size="sm" asChild>
                <Link href="/manage/recurring"><ArrowLeft className="size-4 mr-2" />Back</Link>
            </Button>
            <p className="text-muted-foreground">Recurring expense not found.</p>
        </div>
    );

    const handleDelete = async () => {
        const ok = await confirm();
        if (ok) deleteRecurring.mutate(undefined, { onSuccess: () => router.push("/manage/recurring") });
    };

    const defaultFormValues = {
        name: recurring.name,
        amount: String(convertAmountFromMiliUnits(recurring.amount)),
        frequency: recurring.frequency,
        startDate: new Date(recurring.startDate),
        categoryId: recurring.categoryId ?? undefined,
    };

    return (
        <div className="max-w-screen-sm mx-auto w-full space-y-4">
            <ConfirmDialog />
            <Button variant="ghost" size="sm" asChild>
                <Link href="/manage/recurring"><ArrowLeft className="size-4 mr-2" />Back to Recurring</Link>
            </Button>
            <Card>
                <CardHeader className="flex-row items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-xl">{recurring.name}</CardTitle>
                        {recurring.categoryName && (
                            <p className="text-sm text-muted-foreground mt-1">{recurring.categoryName}</p>
                        )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                        {isEditing ? (
                            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}><X className="size-4" /></Button>
                        ) : (
                            <>
                                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}><Pencil className="size-4 mr-1" />Edit</Button>
                                <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleteRecurring.isPending}
                                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
                                    <Trash2 className="size-4 mr-1" />Delete
                                </Button>
                            </>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <RecurringForm
                            id={id}
                            defaultValues={defaultFormValues}
                            onSubmit={(values) => editRecurring.mutate(values as Parameters<typeof editRecurring.mutate>[0], { onSuccess: () => setIsEditing(false) })}
                            disabled={editRecurring.isPending}
                            categoryOptions={categoryOptions}
                            onCreateCategory={(name) => createCategory.mutate({ name })}
                        />
                    ) : (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Amount</span>
                                <span className="font-bold text-xl">{formatSGD(convertAmountFromMiliUnits(recurring.amount))}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Frequency</span>
                                <Badge variant="secondary" className="capitalize">{recurring.frequency}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Start Date</span>
                                <span className="font-medium">{new Date(recurring.startDate).toLocaleDateString()}</span>
                            </div>
                            {recurring.categoryName && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Category</span>
                                    <span className="font-medium">{recurring.categoryName}</span>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default RecurringDetailPage;
