"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, Shield, AlertCircle, CheckCircle2 } from "lucide-react";
import CurrencyInput from "react-currency-input-field";

import { useGetEmergencyFund } from "@/features/emergency-fund/api/use-get-emergency-fund";
import { useUpdateEmergencyFund } from "@/features/emergency-fund/api/use-update-emergency-fund";
import { convertAmountFromMiliUnits, convertAmountToMiliUnits, formatSGD } from "@/lib/utils";

const formSchema = z.object({
    targetMonths: z.string().min(1, "Required"),
    currentAmount: z.string().min(1, "Required"),
});
type FormValues = z.infer<typeof formSchema>;

const currencyInputClass =
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

const EmergencyFundPage = () => {
    const fundQuery = useGetEmergencyFund();
    const updateMutation = useUpdateEmergencyFund();

    const data = fundQuery.data;
    const fund = data?.fund;
    const avgMonthlyExpenses = data?.avgMonthlyExpenses ?? 0;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            targetMonths: "6",
            currentAmount: "",
        },
    });

    // Prefill form once data is loaded
    useEffect(() => {
        if (!fund) return;
        form.setValue("targetMonths", fund.targetMonths.toString());
        form.setValue("currentAmount", convertAmountFromMiliUnits(fund.currentAmount).toFixed(2));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fund]);

    const watchedMonths = parseInt(form.watch("targetMonths") || "6", 10);
    const watchedAmount = parseFloat(form.watch("currentAmount") || "0");

    // Target = selected months × avg monthly expenses (if available), else months × current/target
    const targetAmount = avgMonthlyExpenses > 0
        ? convertAmountFromMiliUnits(avgMonthlyExpenses) * watchedMonths
        : fund
            ? convertAmountFromMiliUnits(fund.currentAmount > 0 ? fund.currentAmount : 1) * watchedMonths
            : 0;

    const progressPct = targetAmount > 0
        ? Math.min(100, Math.round((watchedAmount / targetAmount) * 100))
        : 0;

    const monthsCovered = targetAmount > 0 && avgMonthlyExpenses > 0
        ? (watchedAmount / convertAmountFromMiliUnits(avgMonthlyExpenses)).toFixed(1)
        : null;

    const handleSubmit = (values: FormValues) => {
        updateMutation.mutate({
            targetMonths: parseInt(values.targetMonths, 10),
            currentAmount: convertAmountToMiliUnits(parseFloat(values.currentAmount) || 0),
        });
    };

    const statusConfig = progressPct >= 100
        ? { label: "Fully funded", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle2 }
        : progressPct >= 50
            ? { label: "On track", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: Shield }
            : { label: "Needs attention", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: AlertCircle };

    const StatusIcon = statusConfig.icon;

    if (fundQuery.isLoading) {
        return (
            <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
                <Card className="border-none drop-shadow-md">
                    <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
                    <CardContent>
                        <div className="h-[400px] w-full flex items-center justify-center">
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
                        <Shield className="size-5 text-muted-foreground" />
                        <CardTitle className="text-xl">Emergency Fund</CardTitle>
                    </div>
                    <CardDescription>
                        Your safety net — typically 3–6 months of living expenses. Set a target and track progress.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* ── Left: Form ── */}
                        <div className="space-y-5">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                                    <FormField
                                        name="targetMonths"
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Target Coverage</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select months" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="3">3 months</SelectItem>
                                                        <SelectItem value="4">4 months</SelectItem>
                                                        <SelectItem value="6">6 months (recommended)</SelectItem>
                                                        <SelectItem value="9">9 months</SelectItem>
                                                        <SelectItem value="12">12 months</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        name="currentAmount"
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Current Savings (SGD)</FormLabel>
                                                <FormControl>
                                                    <CurrencyInput
                                                        prefix="S$"
                                                        placeholder="0.00"
                                                        value={field.value}
                                                        decimalsLimit={2}
                                                        decimalScale={2}
                                                        onValueChange={field.onChange}
                                                        disabled={updateMutation.isPending}
                                                        className={currencyInputClass}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button className="w-full" disabled={updateMutation.isPending}>
                                        {updateMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                                        Save
                                    </Button>
                                </form>
                            </Form>

                            {avgMonthlyExpenses > 0 && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1 border rounded-md px-3 py-2 bg-muted/30">
                                    <Shield className="size-3 shrink-0" />
                                    Avg monthly expenses (last 3 months):{" "}
                                    <span className="font-medium ml-1">
                                        {formatSGD(convertAmountFromMiliUnits(avgMonthlyExpenses))}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* ── Right: Progress ── */}
                        <div className="space-y-5">
                            {/* Status badge */}
                            <div className={`flex items-center gap-3 border rounded-md px-4 py-3 ${statusConfig.bg}`}>
                                <StatusIcon className={`size-5 shrink-0 ${statusConfig.color}`} />
                                <div>
                                    <p className={`font-semibold text-sm ${statusConfig.color}`}>{statusConfig.label}</p>
                                    {monthsCovered !== null && (
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Covers approximately {monthsCovered} months of expenses
                                        </p>
                                    )}
                                </div>
                                <Badge variant="outline" className={`ml-auto ${statusConfig.color}`}>
                                    {progressPct}%
                                </Badge>
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span className="font-medium">{progressPct}% of {watchedMonths}-month target</span>
                                </div>
                                <Progress value={progressPct} className="h-3" />
                            </div>

                            <Separator />

                            {/* Summary cards */}
                            <div className="grid grid-cols-2 gap-3">
                                <Card className="border bg-muted/30">
                                    <CardContent className="pt-4 pb-3">
                                        <p className="text-xs text-muted-foreground">Current Savings</p>
                                        <p className="text-xl font-bold mt-0.5 text-emerald-700">
                                            {formatSGD(watchedAmount || 0)}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="border bg-muted/30">
                                    <CardContent className="pt-4 pb-3">
                                        <p className="text-xs text-muted-foreground">Target ({watchedMonths} months)</p>
                                        <p className="text-xl font-bold mt-0.5">
                                            {targetAmount > 0 ? formatSGD(targetAmount) : "—"}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="border bg-muted/30">
                                    <CardContent className="pt-4 pb-3">
                                        <p className="text-xs text-muted-foreground">Still Needed</p>
                                        <p className={`text-xl font-bold mt-0.5 ${progressPct >= 100 ? "text-emerald-600" : "text-rose-600"}`}>
                                            {progressPct >= 100
                                                ? formatSGD(0)
                                                : formatSGD(Math.max(0, targetAmount - watchedAmount))}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="border bg-muted/30">
                                    <CardContent className="pt-4 pb-3">
                                        <p className="text-xs text-muted-foreground">Months Covered</p>
                                        <p className="text-xl font-bold mt-0.5">
                                            {monthsCovered !== null ? `${monthsCovered} mo` : "—"}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default EmergencyFundPage;
