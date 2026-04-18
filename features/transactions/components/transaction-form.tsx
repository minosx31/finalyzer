"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { insertTransactionSchema } from "@/db/schema";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select } from "@/components/select";
import { DatePicker } from "@/components/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { convertAmountToMiliUnits } from "@/lib/utils";

const formSchema = z.object({
    date: z.coerce.date(),
    type: z.enum(["income", "expense", "transfer"]),
    accountId: z.string(),
    toAccountId: z.string().nullable().optional(),
    categoryId: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    amount: z.string(),
    transferFee: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
});

const apiSchema = insertTransactionSchema.omit({ id: true });

type FormValues = z.input<typeof formSchema>;
type ApiFormValues = z.input<typeof apiSchema>;

type Props = {
    id?: string;
    defaultValues?: Partial<FormValues>;
    onSubmit: (values: ApiFormValues) => void;
    onDelete?: () => void;
    disabled?: boolean;
    accountOptions: { label: string; value: string }[];
    categoryOptions: { label: string; value: string }[];
    onCreateAccount: (name: string) => void;
    onCreateCategory: (name: string) => void;
};

export const TransactionForm = ({
    id,
    defaultValues,
    onSubmit,
    onDelete,
    disabled,
    accountOptions,
    categoryOptions,
    onCreateAccount,
    onCreateCategory,
}: Props) => {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: "expense",
            date: new Date(),
            ...defaultValues,
        },
    });

    const type = form.watch("type");
    const isTransfer = type === "transfer";

    const handleSubmit = (values: FormValues) => {
        const amount = convertAmountToMiliUnits(parseFloat(values.amount));
        const transferFee = values.transferFee ? convertAmountToMiliUnits(parseFloat(values.transferFee)) : null;
        onSubmit({
            ...values,
            amount,
            transferFee,
            toAccountId: isTransfer ? (values.toAccountId ?? null) : null,
            categoryId: isTransfer ? null : (values.categoryId ?? null),
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
                {/* Type selector */}
                <FormField
                    name="type"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Type</FormLabel>
                            <div className="flex gap-2">
                                {(["expense", "income", "transfer"] as const).map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => field.onChange(t)}
                                        className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors capitalize
                                            ${field.value === t
                                                ? t === "expense"
                                                    ? "bg-rose-500 text-white border-rose-500"
                                                    : t === "income"
                                                        ? "bg-emerald-500 text-white border-emerald-500"
                                                        : "bg-blue-500 text-white border-blue-500"
                                                : "bg-background text-muted-foreground border-input hover:bg-accent"
                                            }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </FormItem>
                    )}
                />

                <FormField
                    name="date"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <DatePicker value={field.value} onChange={field.onChange} disabled={disabled} />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    name="accountId"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{isTransfer ? "From Account" : "Account"}</FormLabel>
                            <FormControl>
                                <Select
                                    placeholder="Select Account"
                                    options={accountOptions}
                                    onCreate={onCreateAccount}
                                    value={field.value}
                                    onChange={field.onChange}
                                    disabled={disabled}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                {isTransfer && (
                    <FormField
                        name="toAccountId"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>To Account</FormLabel>
                                <FormControl>
                                    <Select
                                        placeholder="Select Destination Account"
                                        options={accountOptions}
                                        onCreate={onCreateAccount}
                                        value={field.value ?? null}
                                        onChange={field.onChange}
                                        disabled={disabled}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                )}

                {!isTransfer && (
                    <FormField
                        name="categoryId"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <FormControl>
                                    <Select
                                        placeholder="Select Category"
                                        options={categoryOptions}
                                        onCreate={onCreateCategory}
                                        value={field.value ?? null}
                                        onChange={field.onChange}
                                        disabled={disabled}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                )}

                <FormField
                    name="amount"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    disabled={disabled}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                {isTransfer && (
                    <FormField
                        name="transferFee"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Transfer Fee (optional)</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        value={field.value ?? ""}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        disabled={disabled}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                )}

                <FormField
                    name="description"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description (optional)</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    value={field.value ?? ""}
                                    placeholder={isTransfer ? "e.g. Wise transfer" : type === "income" ? "e.g. Monthly salary" : "e.g. Starbucks"}
                                    disabled={disabled}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    name="notes"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes (optional)</FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    value={field.value ?? ""}
                                    placeholder="Any additional notes"
                                    disabled={disabled}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <Button className="w-full" disabled={disabled}>
                    {id ? "Save Changes" : "Create Transaction"}
                </Button>
                {!!id && (
                    <Button
                        type="button"
                        disabled={disabled}
                        onClick={() => onDelete?.()}
                        className="w-full"
                        variant="outline"
                    >
                        <Trash className="size-4 mr-2" />
                        Delete Transaction
                    </Button>
                )}
            </form>
        </Form>
    );
};
