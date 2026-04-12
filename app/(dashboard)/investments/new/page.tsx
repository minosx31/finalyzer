"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InvestmentForm } from "@/features/investments/components/investment-form";
import { useCreateInvestment } from "@/features/investments/api/index";

const NewInvestmentPage = () => {
    const router = useRouter();
    const createInvestment = useCreateInvestment();

    return (
        <div className="max-w-screen-sm mx-auto w-full space-y-4">
            <Button variant="ghost" size="sm" asChild>
                <Link href="/investments"><ArrowLeft className="size-4 mr-2" />Back to Portfolio</Link>
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle>Add Holding</CardTitle>
                    <CardDescription>Add a new investment to your portfolio.</CardDescription>
                </CardHeader>
                <CardContent>
                    <InvestmentForm
                        onSubmit={(values) => createInvestment.mutate(values as Parameters<typeof createInvestment.mutate>[0], {
                            onSuccess: () => router.push("/investments"),
                        })}
                        disabled={createInvestment.isPending}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default NewInvestmentPage;
