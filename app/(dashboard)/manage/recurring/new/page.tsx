"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RecurringForm } from "@/features/recurring/components/recurring-form";
import { useCreateRecurringExpense } from "@/features/recurring/api/index";
import { useGetCategories, useCreateCategory } from "@/features/categories/api/index";

const NewRecurringPage = () => {
    const router = useRouter();
    const createRecurring = useCreateRecurringExpense();
    const { data: categories = [] } = useGetCategories();
    const createCategory = useCreateCategory();

    const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id }));

    return (
        <div className="max-w-screen-sm mx-auto w-full space-y-4">
            <Button variant="ghost" size="sm" asChild>
                <Link href="/manage/recurring"><ArrowLeft className="size-4 mr-2" />Back to Recurring</Link>
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle>New Recurring Expense</CardTitle>
                    <CardDescription>Set up an expense that repeats on a schedule.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RecurringForm
                        onSubmit={(values) => createRecurring.mutate(values as Parameters<typeof createRecurring.mutate>[0], {
                            onSuccess: () => router.push("/manage/recurring"),
                        })}
                        disabled={createRecurring.isPending}
                        categoryOptions={categoryOptions}
                        onCreateCategory={(name) => createCategory.mutate({ name })}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default NewRecurringPage;
