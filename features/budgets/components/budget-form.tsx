"use client";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select as UiSelect,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Select } from "@/components/select";
import { insertBudgetSchema } from "@/db/schema";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import CurrencyInput from "react-currency-input-field";
import { convertAmountToMiliUnits } from "@/lib/utils";

const formSchema = z.object({
    categoryId: z.string().nullable().optional(),
    amount: z.string().min(1, "Amount is required"),
    period: z.enum(["monthly", "annual"]),
});

const apiSchema = insertBudgetSchema.pick({
    categoryId: true,
    amount: true,
    period: true,
});

type FormValues = z.infer<typeof formSchema>;
type ApiValues = z.infer<typeof apiSchema>;

type Props = {
    id?: string;
    defaultValues?: FormValues;
    onSubmit: (values: ApiValues) => void;
    onDelete?: () => void;
    disabled?: boolean;
    onCreateCategory: (name: string) => void;
    categoryOptions?: { label: string; value: string }[];
};

export const BudgetForm = ({
    id,
    defaultValues,
    onSubmit,
    onDelete,
    disabled,
    onCreateCategory,
    categoryOptions = [],
}: Props) => {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues ?? {
            categoryId: null,
            amount: "",
            period: "monthly",
        },
    });

    const handleSubmit = (values: FormValues) => {
        onSubmit({
            categoryId: values.categoryId ?? null,
            amount: convertAmountToMiliUnits(parseFloat(values.amount)),
            period: values.period,
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
                <FormField
                    name="categoryId"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                                <Select
                                    onChange={field.onChange}
                                    onCreate={onCreateCategory}
                                    value={field.value ?? ""}
                                    options={categoryOptions}
                                    disabled={disabled}
                                    placeholder="Select category (or leave blank for overall)"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    name="amount"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Budget Amount (SGD)</FormLabel>
                            <FormControl>
                                <CurrencyInput
                                    prefix="$"
                                    placeholder="0.00"
                                    value={field.value}
                                    decimalsLimit={2}
                                    decimalScale={2}
                                    onValueChange={field.onChange}
                                    disabled={disabled}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    name="period"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Period</FormLabel>
                            <UiSelect
                                disabled={disabled}
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select period" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="annual">Annual</SelectItem>
                                </SelectContent>
                            </UiSelect>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button className="w-full" disabled={disabled}>
                    {id ? "Save Changes" : "Create Budget"}
                </Button>
                {!!id && (
                    <Button
                        type="button"
                        disabled={disabled}
                        onClick={onDelete}
                        className="w-full"
                        variant="outline"
                    >
                        <Trash className="size-4 mr-2" />
                        Delete Budget
                    </Button>
                )}
            </form>
        </Form>
    );
};
