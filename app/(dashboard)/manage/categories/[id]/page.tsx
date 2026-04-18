"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryForm } from "@/features/categories/components/category-form";
import { useGetCategory, useEditCategory, useDeleteCategory } from "@/features/categories/api/index";
import { useConfirm } from "@/hooks/use-confirm";

type Props = { params: { id: string } };

const CategoryDetailPage = ({ params }: Props) => {
    const { id } = params;
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const { data: category, isLoading } = useGetCategory(id);
    const editCategory = useEditCategory(id);
    const deleteCategory = useDeleteCategory(id);
    const [ConfirmDialog, confirm] = useConfirm("Delete Category", "This category will be removed. Transactions using it will have their category cleared.");

    if (isLoading) return (
        <div className="max-w-screen-sm mx-auto w-full space-y-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-40 rounded-xl" />
        </div>
    );

    if (!category) return (
        <div className="max-w-screen-sm mx-auto w-full space-y-4">
            <Button variant="ghost" size="sm" asChild>
                <Link href="/manage/categories"><ArrowLeft className="size-4 mr-2" />Back</Link>
            </Button>
            <p className="text-muted-foreground">Category not found.</p>
        </div>
    );

    const handleDelete = async () => {
        const ok = await confirm();
        if (ok) deleteCategory.mutate(undefined, { onSuccess: () => router.push("/manage/categories") });
    };

    return (
        <div className="max-w-screen-sm mx-auto w-full space-y-4">
            <ConfirmDialog />
            <Button variant="ghost" size="sm" asChild>
                <Link href="/manage/categories"><ArrowLeft className="size-4 mr-2" />Back to Categories</Link>
            </Button>
            <Card>
                <CardHeader className="flex-row items-center justify-between gap-4">
                    <CardTitle className="text-xl">{category.name}</CardTitle>
                    <div className="flex gap-2 shrink-0">
                        {isEditing ? (
                            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}><X className="size-4" /></Button>
                        ) : (
                            <>
                                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}><Pencil className="size-4 mr-1" />Edit</Button>
                                <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleteCategory.isPending}
                                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
                                    <Trash2 className="size-4 mr-1" />Delete
                                </Button>
                            </>
                        )}
                    </div>
                </CardHeader>
                {isEditing && (
                    <CardContent>
                        <CategoryForm
                            id={id}
                            defaultValues={{ name: category.name }}
                            onSubmit={(values) => editCategory.mutate(values, { onSuccess: () => setIsEditing(false) })}
                            disabled={editCategory.isPending}
                        />
                    </CardContent>
                )}
            </Card>
        </div>
    );
};

export default CategoryDetailPage;
