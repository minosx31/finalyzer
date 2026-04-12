"use client";

import Link from "next/link";
import { Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetCategories } from "@/features/categories/api/index";

const CategoriesPage = () => {
    const { data: categories, isLoading } = useGetCategories();

    if (isLoading) {
        return (
            <div className="max-w-screen-2xl mx-auto w-full space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-9 w-32" />
                </div>
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-screen-2xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Categories</h1>
                <Button asChild size="sm">
                    <Link href="/manage/categories/new">
                        <Plus className="size-4 mr-2" />
                        Add Category
                    </Link>
                </Button>
            </div>

            {(!categories || categories.length === 0) ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <Tag className="size-10 text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">No categories yet.</p>
                        <Button asChild size="sm" className="mt-4">
                            <Link href="/manage/categories/new">Add your first category</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    {categories.map((cat) => (
                        <Link key={cat.id} href={`/manage/categories/${cat.id}`}>
                            <div className="flex items-center justify-between px-4 py-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <Tag className="size-4 text-muted-foreground" />
                                    <span className="font-medium">{cat.name}</span>
                                </div>
                                <span className="text-muted-foreground text-sm">→</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoriesPage;
