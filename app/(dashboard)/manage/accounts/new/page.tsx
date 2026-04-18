"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AccountForm } from "@/features/accounts/components/account-form";
import { useCreateAccount } from "@/features/accounts/api/index";

const NewAccountPage = () => {
    const router = useRouter();
    const createAccount = useCreateAccount();

    const handleSubmit = (values: Parameters<typeof createAccount.mutate>[0]) => {
        createAccount.mutate(values, {
            onSuccess: () => {
                router.push("/manage/accounts");
            },
        });
    };

    return (
        <div className="max-w-screen-sm mx-auto w-full space-y-4">
            <Button variant="ghost" size="sm" asChild>
                <Link href="/manage/accounts">
                    <ArrowLeft className="size-4 mr-2" />
                    Back to Accounts
                </Link>
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>New Account</CardTitle>
                    <CardDescription>
                        Add a bank, credit card, investment, or loan account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AccountForm
                        onSubmit={handleSubmit}
                        disabled={createAccount.isPending}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default NewAccountPage;
