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
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { insertInvestmentSchema } from "@/db/schema";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import CurrencyInput from "react-currency-input-field";
import { convertAmountToMiliUnits } from "@/lib/utils";

const formSchema = z.object({
    ticker: z.string().min(1, "Ticker is required"),
    name: z.string().min(1, "Name is required"),
    type: z.enum(["stock", "etf", "reit", "bond", "crypto", "other"]),
    exchange: z.string().optional(),
    shares: z.string().min(1, "Shares is required"),
    avgCostPrice: z.string().min(1, "Average cost price is required"),
    currentPrice: z.string().min(1, "Current price is required"),
    currency: z.string().default("SGD"),
});

const apiSchema = insertInvestmentSchema.pick({
    ticker: true, name: true, type: true, exchange: true,
    shares: true, avgCostPrice: true, currentPrice: true, currency: true,
});

type FormValues = z.infer<typeof formSchema>;
type ApiValues = z.infer<typeof apiSchema>;

type Props = {
    id?: string;
    defaultValues?: FormValues;
    onSubmit: (values: ApiValues) => void;
    onDelete?: () => void;
    disabled?: boolean;
};

export const InvestmentForm = ({ id, defaultValues, onSubmit, onDelete, disabled }: Props) => {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues ?? {
            ticker: "", name: "", type: "stock", exchange: "SGX",
            shares: "", avgCostPrice: "", currentPrice: "", currency: "SGD",
        },
    });

    const handleSubmit = (values: FormValues) => {
        onSubmit({
            ticker: values.ticker,
            name: values.name,
            type: values.type,
            exchange: values.exchange ?? null,
            // shares stored as milliunits to support fractional shares
            shares: Math.round(parseFloat(values.shares) * 1000),
            avgCostPrice: convertAmountToMiliUnits(parseFloat(values.avgCostPrice)),
            currentPrice: convertAmountToMiliUnits(parseFloat(values.currentPrice)),
            currency: values.currency,
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-3">
                    <FormField name="ticker" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ticker</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. ES3.SI" disabled={disabled} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="exchange" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Exchange</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. SGX" disabled={disabled} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                <FormField name="name" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. SPDR STI ETF" disabled={disabled} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-3">
                    <FormField name="type" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select disabled={disabled} onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="stock">Stock</SelectItem>
                                    <SelectItem value="etf">ETF</SelectItem>
                                    <SelectItem value="reit">REIT</SelectItem>
                                    <SelectItem value="bond">Bond</SelectItem>
                                    <SelectItem value="crypto">Crypto</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="currency" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <Select disabled={disabled} onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="SGD">SGD</SelectItem>
                                    <SelectItem value="USD">USD</SelectItem>
                                    <SelectItem value="HKD">HKD</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                <FormField name="shares" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Number of Shares</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.001" placeholder="e.g. 100" disabled={disabled} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-3">
                    <FormField name="avgCostPrice" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Avg Cost Price</FormLabel>
                            <FormControl>
                                <CurrencyInput prefix="$" placeholder="0.00" value={field.value}
                                    decimalsLimit={4} decimalScale={4} onValueChange={field.onChange}
                                    disabled={disabled}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="currentPrice" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Current Price</FormLabel>
                            <FormControl>
                                <CurrencyInput prefix="$" placeholder="0.00" value={field.value}
                                    decimalsLimit={4} decimalScale={4} onValueChange={field.onChange}
                                    disabled={disabled}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                <Button className="w-full" disabled={disabled}>
                    {id ? "Save Changes" : "Add Investment"}
                </Button>
                {!!id && (
                    <Button type="button" disabled={disabled} onClick={onDelete} className="w-full" variant="outline">
                        <Trash className="size-4 mr-2" />
                        Remove Investment
                    </Button>
                )}
            </form>
        </Form>
    );
};
