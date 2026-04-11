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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import CurrencyInput from "react-currency-input-field";
import { convertAmountToMiliUnits } from "@/lib/utils";

const formSchema = z.object({
    monthlyIncome: z.string().min(1, "Monthly income is required"),
    annualIncome: z.string().min(1, "Annual income is required"),
    age: z.string().min(1, "Age is required"),
    citizenshipStatus: z.enum(["citizen", "pr", "foreigner"]),
    expectedSavingsRate: z.string().min(1, "Expected savings rate is required"),
});

type FormValues = z.infer<typeof formSchema>;

type ApiValues = {
    monthlyIncome: number;
    annualIncome: number;
    age: number;
    citizenshipStatus: string;
    expectedSavingsRate: number;
};

type Props = {
    defaultValues?: FormValues;
    onSubmit: (values: ApiValues) => void;
    disabled?: boolean;
};

export const ProfileForm = ({ defaultValues, onSubmit, disabled }: Props) => {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues ?? {
            monthlyIncome: "",
            annualIncome: "",
            age: "",
            citizenshipStatus: "citizen",
            expectedSavingsRate: "20",
        },
    });

    const handleSubmit = (values: FormValues) => {
        onSubmit({
            monthlyIncome: convertAmountToMiliUnits(parseFloat(values.monthlyIncome)),
            annualIncome: convertAmountToMiliUnits(parseFloat(values.annualIncome)),
            age: parseInt(values.age, 10),
            citizenshipStatus: values.citizenshipStatus,
            expectedSavingsRate: parseInt(values.expectedSavingsRate, 10),
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        name="monthlyIncome"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Monthly Income (SGD)</FormLabel>
                                <FormControl>
                                    <CurrencyInput
                                        prefix="$"
                                        placeholder="0.00"
                                        value={field.value}
                                        decimalsLimit={2}
                                        decimalScale={2}
                                        onValueChange={field.onChange}
                                        disabled={disabled}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="annualIncome"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Annual Income (SGD)</FormLabel>
                                <FormControl>
                                    <CurrencyInput
                                        prefix="$"
                                        placeholder="0.00"
                                        value={field.value}
                                        decimalsLimit={2}
                                        decimalScale={2}
                                        onValueChange={field.onChange}
                                        disabled={disabled}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="age"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Age</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={16}
                                        max={100}
                                        placeholder="e.g. 30"
                                        disabled={disabled}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="citizenshipStatus"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Citizenship Status</FormLabel>
                                <Select
                                    disabled={disabled}
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="citizen">Singapore Citizen</SelectItem>
                                        <SelectItem value="pr">Permanent Resident</SelectItem>
                                        <SelectItem value="foreigner">Foreigner / EP Holder</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="expectedSavingsRate"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Expected Savings Rate (%)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={100}
                                        placeholder="e.g. 20"
                                        disabled={disabled}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button className="w-full" disabled={disabled}>
                    Save Profile
                </Button>
            </form>
        </Form>
    );
};
