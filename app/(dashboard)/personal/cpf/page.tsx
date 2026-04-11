"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Loader2, RefreshCw, Landmark, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import CurrencyInput from "react-currency-input-field";

import { useGetCPFAccount } from "@/features/cpf/api/use-get-cpf-account";
import { useGetCPFContributions } from "@/features/cpf/api/use-get-cpf-contributions";
import { useGenerateCPFContribution } from "@/features/cpf/api/use-generate-cpf-contribution";
import { useUpdateCPFBalances } from "@/features/cpf/api/use-update-cpf-balances";
import { useGetProfile } from "@/features/profile/api/use-get-profile";
import {
    convertAmountFromMiliUnits, convertAmountToMiliUnits, formatSGD,
} from "@/lib/utils";
import { projectCPFAtRetirement } from "@/lib/sg-cpf";
import { columns, type ContributionRow } from "./columns";

// ─── Balance update form ──────────────────────────────────────────────────────

const balanceSchema = z.object({
    oaBalance: z.string().min(1, "Required"),
    saBalance: z.string().min(1, "Required"),
    maBalance: z.string().min(1, "Required"),
    raBalance: z.string(),
});
type BalanceFormValues = z.infer<typeof balanceSchema>;

const currencyInputClass =
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

function BalanceForm({
    defaultValues,
    onSubmit,
    disabled,
}: {
    defaultValues?: BalanceFormValues;
    onSubmit: (values: { oaBalance: number; saBalance: number; maBalance: number; raBalance: number }) => void;
    disabled?: boolean;
}) {
    const form = useForm<BalanceFormValues>({
        resolver: zodResolver(balanceSchema),
        defaultValues: defaultValues ?? { oaBalance: "", saBalance: "", maBalance: "", raBalance: "0" },
    });

    const handleSubmit = (values: BalanceFormValues) => {
        onSubmit({
            oaBalance: convertAmountToMiliUnits(parseFloat(values.oaBalance) || 0),
            saBalance: convertAmountToMiliUnits(parseFloat(values.saBalance) || 0),
            maBalance: convertAmountToMiliUnits(parseFloat(values.maBalance) || 0),
            raBalance: convertAmountToMiliUnits(parseFloat(values.raBalance) || 0),
        });
    };

    const fields: { name: keyof BalanceFormValues; label: string; description: string }[] = [
        { name: "oaBalance", label: "Ordinary Account (OA)", description: "Can be used for housing, CPF investment, insurance" },
        { name: "saBalance", label: "Special Account (SA)", description: "For retirement and investment in retirement-related products" },
        { name: "maBalance", label: "MediSave Account (MA)", description: "For hospitalisation and approved medical insurance" },
        { name: "raBalance", label: "Retirement Account (RA)", description: "For age 55+ — formed from OA and SA savings" },
    ];

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fields.map(({ name, label, description }) => (
                        <FormField
                            key={name}
                            name={name}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{label}</FormLabel>
                                    <FormControl>
                                        <CurrencyInput
                                            prefix="S$"
                                            placeholder="0.00"
                                            value={field.value}
                                            decimalsLimit={2}
                                            decimalScale={2}
                                            onValueChange={field.onChange}
                                            disabled={disabled}
                                            className={currencyInputClass}
                                        />
                                    </FormControl>
                                    <p className="text-xs text-muted-foreground">{description}</p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                </div>
                <Button className="w-full" disabled={disabled}>
                    {disabled ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                    Update CPF Balances
                </Button>
            </form>
        </Form>
    );
}

// ─── Balance card ─────────────────────────────────────────────────────────────

function BalanceCard({
    label,
    amount,
    description,
    accent,
}: {
    label: string;
    amount: number; // milliunits
    description: string;
    accent: string;
}) {
    const value = convertAmountFromMiliUnits(amount);
    return (
        <Card className="border-none drop-shadow-sm">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                    <Badge variant="outline" className={`text-xs ${accent}`}>{label.split(" ")[0]}</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">{formatSGD(value)}</p>
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </CardContent>
        </Card>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const CPFPage = () => {
    const [retirementAge, setRetirementAge] = useState(65);

    const accountQuery = useGetCPFAccount();
    const contributionsQuery = useGetCPFContributions();
    const profileQuery = useGetProfile();
    const generateMutation = useGenerateCPFContribution();
    const updateMutation = useUpdateCPFBalances();

    const account = accountQuery.data;
    const profile = profileQuery.data;
    const contributions = contributionsQuery.data ?? [];

    const isLoading = accountQuery.isLoading || profileQuery.isLoading;

    // Transform contributions for DataTable
    const tableRows: ContributionRow[] = contributions.map((c) => ({
        id: c.id,
        monthLabel: format(new Date(c.month), "MMM yyyy"),
        grossSalary: c.grossSalary,
        employeeContribution: c.employeeContribution,
        employerContribution: c.employerContribution,
        oaAmount: c.oaAmount,
        saAmount: c.saAmount,
        maAmount: c.maAmount,
        raAmount: c.raAmount,
    }));

    // Projection data — only compute when we have profile + account
    const projectionData = (profile?.age && account)
        ? projectCPFAtRetirement(
            {
                oaBalance: account.oaBalance,
                saBalance: account.saBalance,
                maBalance: account.maBalance,
                raBalance: account.raBalance,
            },
            profile.monthlyIncome,
            profile.age,
            retirementAge,
        ).map((p) => ({
            year: `${p.year} (${p.age})`,
            OA: Math.round(convertAmountFromMiliUnits(p.oaBalance)),
            SA: Math.round(convertAmountFromMiliUnits(p.saBalance)),
            MA: Math.round(convertAmountFromMiliUnits(p.maBalance)),
            RA: Math.round(convertAmountFromMiliUnits(p.raBalance)),
            Total: Math.round(convertAmountFromMiliUnits(p.totalBalance)),
        }))
        : [];

    const totalBalance = account
        ? account.oaBalance + account.saBalance + account.maBalance + account.raBalance
        : 0;

    const balanceDefaults = account
        ? {
            oaBalance: convertAmountFromMiliUnits(account.oaBalance).toFixed(2),
            saBalance: convertAmountFromMiliUnits(account.saBalance).toFixed(2),
            maBalance: convertAmountFromMiliUnits(account.maBalance).toFixed(2),
            raBalance: convertAmountFromMiliUnits(account.raBalance).toFixed(2),
        }
        : undefined;

    if (isLoading) {
        return (
            <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
                <Card className="border-none drop-shadow-md">
                    <CardHeader>
                        <Skeleton className="h-8 w-48" />
                    </CardHeader>
                    <CardContent>
                        <div className="h-[500px] w-full flex items-center justify-center">
                            <Loader2 className="size-6 text-slate-300 animate-spin" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
            <Card className="border-none drop-shadow-md">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Landmark className="size-5 text-muted-foreground" />
                        <CardTitle className="text-xl">CPF Tracker</CardTitle>
                    </div>
                    <CardDescription>
                        Track your Central Provident Fund balances, contributions, and retirement projection.
                        Rates effective January 2026.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="overview">
                        <TabsList className="mb-6">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="contributions">Contributions</TabsTrigger>
                            <TabsTrigger value="projection">Projection</TabsTrigger>
                            <TabsTrigger value="update">Update Balances</TabsTrigger>
                        </TabsList>

                        {/* ── Overview ── */}
                        <TabsContent value="overview">
                            {!account ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                                    <AlertCircle className="size-10 text-muted-foreground" />
                                    <div>
                                        <p className="font-semibold text-lg">No CPF data yet</p>
                                        <p className="text-muted-foreground text-sm mt-1">
                                            Generate your first contribution or manually enter your balances to get started.
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => generateMutation.mutate()}
                                            disabled={generateMutation.isPending || !profile?.age}
                                        >
                                            {generateMutation.isPending
                                                ? <Loader2 className="mr-2 size-4 animate-spin" />
                                                : <RefreshCw className="mr-2 size-4" />
                                            }
                                            Generate this month
                                        </Button>
                                    </div>
                                    {!profile?.age && (
                                        <p className="text-xs text-amber-600">
                                            Set your age in Profile before generating contributions.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <BalanceCard
                                            label="Ordinary Account"
                                            amount={account.oaBalance}
                                            description="Housing, investment, insurance"
                                            accent="text-blue-600"
                                        />
                                        <BalanceCard
                                            label="Special Account"
                                            amount={account.saBalance}
                                            description="Retirement & retirement-related investments"
                                            accent="text-emerald-600"
                                        />
                                        <BalanceCard
                                            label="MediSave Account"
                                            amount={account.maBalance}
                                            description="Hospitalisation & medical insurance"
                                            accent="text-purple-600"
                                        />
                                        <BalanceCard
                                            label="Retirement Account"
                                            amount={account.raBalance}
                                            description="For members aged 55+ only"
                                            accent="text-orange-600"
                                        />
                                    </div>
                                    <Card className="border bg-muted/30">
                                        <CardContent className="pt-4 flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Total CPF Balance</p>
                                                <p className="text-3xl font-bold mt-1">{formatSGD(convertAmountFromMiliUnits(totalBalance))}</p>
                                            </div>
                                            <div className="text-right text-sm text-muted-foreground">
                                                {account.updatedAt && (
                                                    <p>Last updated {format(new Date(account.updatedAt), "d MMM yyyy")}</p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </TabsContent>

                        {/* ── Contributions ── */}
                        <TabsContent value="contributions">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">Monthly Contribution History</p>
                                        <p className="text-xs text-muted-foreground">
                                            Auto-calculated from your monthly income and age using official CPF rates.
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => generateMutation.mutate()}
                                        disabled={generateMutation.isPending || !profile?.monthlyIncome || !profile?.age}
                                    >
                                        {generateMutation.isPending
                                            ? <Loader2 className="mr-2 size-4 animate-spin" />
                                            : <RefreshCw className="mr-2 size-4" />
                                        }
                                        Generate this month
                                    </Button>
                                </div>
                                {!profile?.age && (
                                    <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                                        <AlertCircle className="size-3.5 shrink-0" />
                                        Set your age and monthly income in Profile to enable contribution generation.
                                    </div>
                                )}
                                {contributionsQuery.isLoading ? (
                                    <div className="h-[300px] flex items-center justify-center">
                                        <Loader2 className="size-6 text-slate-300 animate-spin" />
                                    </div>
                                ) : (
                                    <DataTable
                                        columns={columns}
                                        data={tableRows}
                                        filterKey="monthLabel"
                                        onDelete={() => {}}
                                        disabled={false}
                                    />
                                )}
                            </div>
                        </TabsContent>

                        {/* ── Projection ── */}
                        <TabsContent value="projection">
                            {!profile?.age || !profile?.monthlyIncome ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
                                    <AlertCircle className="size-10 text-muted-foreground" />
                                    <p className="font-semibold">Profile required</p>
                                    <p className="text-sm text-muted-foreground">
                                        Set your age and monthly income in Profile to see your CPF retirement projection.
                                    </p>
                                </div>
                            ) : !account ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
                                    <AlertCircle className="size-10 text-muted-foreground" />
                                    <p className="font-semibold">No CPF balances yet</p>
                                    <p className="text-sm text-muted-foreground">
                                        Add your CPF balances first to see the projection.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <div>
                                            <p className="text-sm font-medium">CPF Balance Projection</p>
                                            <p className="text-xs text-muted-foreground">
                                                Projected using OA 2.5% p.a., SA/RA/MA 4% p.a. interest rates
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-muted-foreground">Retire at age</span>
                                            {[60, 62, 65, 70].map((age) => (
                                                <Button
                                                    key={age}
                                                    size="sm"
                                                    variant={retirementAge === age ? "default" : "outline"}
                                                    className="h-7 px-2 text-xs"
                                                    onClick={() => setRetirementAge(age)}
                                                >
                                                    {age}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    {projectionData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={350}>
                                            <LineChart data={projectionData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="year"
                                                    tick={{ fontSize: 11 }}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    interval="preserveStartEnd"
                                                />
                                                <YAxis
                                                    tick={{ fontSize: 11 }}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickFormatter={(v) => `S$${(v / 1000).toFixed(0)}k`}
                                                />
                                                <Tooltip
                                                    formatter={(value: number) => [formatSGD(value), ""]}
                                                    labelStyle={{ fontSize: 12 }}
                                                    contentStyle={{ fontSize: 12 }}
                                                />
                                                <Legend />
                                                <Line type="monotone" dataKey="Total" stroke="#3D82F6" strokeWidth={2} dot={false} />
                                                <Line type="monotone" dataKey="OA" stroke="#10B981" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                                                <Line type="monotone" dataKey="SA" stroke="#8B5CF6" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                                                <Line type="monotone" dataKey="MA" stroke="#F59E0B" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                                                {account.raBalance > 0 && (
                                                    <Line type="monotone" dataKey="RA" stroke="#EF4444" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                                                )}
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-8">
                                            Already at or past target retirement age.
                                        </p>
                                    )}

                                    {projectionData.length > 0 && (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                                            {[
                                                { label: "Projected Total", value: projectionData[projectionData.length - 1]?.Total ?? 0, color: "text-blue-600" },
                                                { label: "Projected OA", value: projectionData[projectionData.length - 1]?.OA ?? 0, color: "text-emerald-600" },
                                                { label: "Projected SA", value: projectionData[projectionData.length - 1]?.SA ?? 0, color: "text-purple-600" },
                                                { label: "Projected MA", value: projectionData[projectionData.length - 1]?.MA ?? 0, color: "text-amber-600" },
                                            ].map(({ label, value, color }) => (
                                                <Card key={label} className="border bg-muted/30">
                                                    <CardContent className="pt-3 pb-3">
                                                        <p className="text-xs text-muted-foreground">{label} at {retirementAge}</p>
                                                        <p className={`text-sm font-semibold mt-0.5 ${color}`}>{formatSGD(value)}</p>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </TabsContent>

                        {/* ── Update Balances ── */}
                        <TabsContent value="update">
                            <div className="max-w-2xl">
                                <div className="mb-4">
                                    <p className="text-sm text-muted-foreground">
                                        Manually reconcile your CPF balances to match your CPF statement.
                                        This overrides the auto-calculated values.
                                    </p>
                                </div>
                                <BalanceForm
                                    key={account ? "loaded" : "empty"}
                                    defaultValues={balanceDefaults}
                                    onSubmit={(values) => updateMutation.mutate(values)}
                                    disabled={updateMutation.isPending}
                                />
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default CPFPage;
