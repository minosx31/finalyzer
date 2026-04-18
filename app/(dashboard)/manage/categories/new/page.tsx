"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CategoryForm } from "@/features/categories/components/category-form";
import { useCreateCategory } from "@/features/categories/api/index";

const NewCategoryPage = () => {
    const router = useRouter();
    const createCategory = useCreateCategory();

    return (
        <div className="max-w-screen-sm mx-auto w-full space-y-4">
            <Button variant="ghost" size="sm" asChild>
                <Link href="/manage/categories"><ArrowLeft className="size-4 mr-2" />Back to Categories</Link>
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle>New Category</CardTitle>
                    <CardDescription>Create a category to organise your transactions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CategoryForm
                        onSubmit={(values) => createCategory.mutate(values, {
                            onSuccess: () => router.push("/manage/categories"),
                        })}
                        disabled={createCategory.isPending}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default NewCategoryPage;
