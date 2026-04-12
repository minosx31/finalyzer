"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BudgetForm } from "@/features/budgets/components/budget-form";
import { useCreateBudget } from "@/features/budgets/api/index";
import { useGetCategories, useCreateCategory } from "@/features/categories/api/index";

const NewBudgetPage = () => {
    const router = useRouter();
    const createBudget = useCreateBudget();
    const { data: categories = [] } = useGetCategories();
    const createCategory = useCreateCategory();

    const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id }));

    return (
        <div className="max-w-screen-sm mx-auto w-full space-y-4">
            <Button variant="ghost" size="sm" asChild>
                <Link href="/planning/budgets"><ArrowLeft className="size-4 mr-2" />Back to Budgets</Link>
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle>New Budget</CardTitle>
                    <CardDescription>Set a spending limit for a category.</CardDescription>
                </CardHeader>
                <CardContent>
                    <BudgetForm
                        onSubmit={(values) => createBudget.mutate(values as Parameters<typeof createBudget.mutate>[0], {
                            onSuccess: () => router.push("/planning/budgets"),
                        })}
                        disabled={createBudget.isPending}
                        categoryOptions={categoryOptions}
                        onCreateCategory={(name) => createCategory.mutate({ name })}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default NewBudgetPage;
