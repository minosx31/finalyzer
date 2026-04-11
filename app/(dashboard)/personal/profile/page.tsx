"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { useGetProfile } from "@/features/profile/api/use-get-profile";
import { useUpdateProfile } from "@/features/profile/api/use-update-profile";
import { convertAmountFromMiliUnits } from "@/lib/utils";

const ProfilePage = () => {
    const profileQuery = useGetProfile();
    const updateMutation = useUpdateProfile();

    const profile = profileQuery.data;
    const isLoading = profileQuery.isLoading;

    const defaultValues = profile
        ? {
              monthlyIncome: convertAmountFromMiliUnits(profile.monthlyIncome).toString(),
              annualIncome: convertAmountFromMiliUnits(profile.annualIncome).toString(),
              age: profile.age?.toString() ?? "",
              citizenshipStatus: (profile.citizenshipStatus ?? "citizen") as "citizen" | "pr" | "foreigner",
              expectedSavingsRate: (profile.expectedSavingsRate ?? 20).toString(),
          }
        : undefined;

    return (
        <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
            <Card className="border-none drop-shadow-md">
                <CardHeader>
                    <CardTitle className="text-xl">My Profile</CardTitle>
                    <CardDescription>
                        Your financial profile is used to auto-calculate CPF contributions, income tax estimates,
                        and expected savings targets.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : (
                        <ProfileForm
                            defaultValues={defaultValues}
                            onSubmit={(values) => updateMutation.mutate(values)}
                            disabled={updateMutation.isPending}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ProfilePage;
