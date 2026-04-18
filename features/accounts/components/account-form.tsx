import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { insertAccountSchema } from "@/db/schema";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select } from "@/components/select";
import CurrencyInput from "react-currency-input-field";
import { convertAmountFromMiliUnits, convertAmountToMiliUnits } from "@/lib/utils";

// Schema for the form (everything is a string or potentially undefined/null for UI state)
const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.string().optional(),
    initialBalance: z.string().optional(), // User inputs "1000.00"
    creditLimit: z.string().optional(),    // User inputs "1000.00"
    dueDate: z.string().optional(),        // User selects "5"
    interestRate: z.string().optional(),   // User inputs "5.5"
    currency: z.string().optional(),
});

const apiSchema = insertAccountSchema.pick({
    name: true,
    type: true,
    initialBalance: true,
    creditLimit: true,
    dueDate: true,
    interestRate: true,
    currency: true,
});

type FormValues = z.input<typeof formSchema>;
type ApiValues = z.input<typeof apiSchema>;

type Props = {
    id?: string,
    defaultValues?: FormValues,
    onSubmit: (values: ApiValues) => void,
    onDelete?: () => void,
    disabled?: boolean,
};

const ACCOUNT_TYPE_OPTIONS = [
    { label: "Checking", value: "checking" },
    { label: "Savings", value: "savings" },
    { label: "Credit Card", value: "credit" },
    { label: "Investment", value: "investment" },
    { label: "Loan", value: "loan" },
    { label: "Other", value: "other" },
];

const DUE_DATE_OPTIONS = Array.from({ length: 31 }, (_, i) => ({
    label: (i + 1).toString(),
    value: (i + 1).toString(),
}));

export const AccountForm = ({
    id, defaultValues, onSubmit, onDelete, disabled,
}: Props) => {
    
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues,
    });

    const handleSubmit = (values: FormValues) => {
        const initialBalance = values.initialBalance ? convertAmountToMiliUnits(parseFloat(values.initialBalance)) : undefined;
        const creditLimit = values.creditLimit ? convertAmountToMiliUnits(parseFloat(values.creditLimit)) : undefined;
        const interestRate = values.interestRate ? Math.round(parseFloat(values.interestRate) * 100) : undefined; // 5.5% -> 550 basis points
        const dueDate = values.dueDate ? parseInt(values.dueDate) : undefined;

        onSubmit({
            name: values.name,
            type: values.type,
            initialBalance,
            creditLimit,
            dueDate,
            interestRate,
            currency: values.currency ?? "SGD",
        });
    };

    const handleDelete = () => {
        onDelete?.();
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4 pt-4"
            >
                <FormField
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Name
                            </FormLabel>
                            <FormControl>
                                <Input
                                    disabled={disabled}
                                    placeholder="e.g. Cash, Bank, Credit Card"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    name="type"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Account Type
                            </FormLabel>
                            <FormControl>
                                <Select
                                    placeholder="Select type"
                                    options={ACCOUNT_TYPE_OPTIONS}
                                    onCreate={() => {}} // Not supporting custom types for now to keep it clean
                                    value={field.value}
                                    onChange={field.onChange}
                                    disabled={disabled}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    name="initialBalance"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Opening Balance
                            </FormLabel>
                            <FormControl>
                                <CurrencyInput
                                    prefix="$"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="0.00"
                                    value={field.value}
                                    decimalsLimit={2}
                                    decimalScale={2}
                                    onValueChange={field.onChange}
                                    disabled={disabled}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                     <FormField
                        name="creditLimit"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Credit Limit
                                </FormLabel>
                                <FormControl>
                                    <CurrencyInput
                                        prefix="$"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="0.00"
                                        value={field.value}
                                        decimalsLimit={2}
                                        decimalScale={2}
                                        onValueChange={field.onChange}
                                        disabled={disabled}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="interestRate"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Interest Rate (%)
                                </FormLabel>
                                <FormControl>
                                    <CurrencyInput
                                        suffix="%"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="0.00"
                                        value={field.value}
                                        decimalsLimit={2}
                                        decimalScale={2}
                                        onValueChange={field.onChange}
                                        disabled={disabled}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
               
                <FormField
                    name="dueDate"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Due Date (Day of Month)
                            </FormLabel>
                            <FormControl>
                                <Select
                                    placeholder="Select day"
                                    options={DUE_DATE_OPTIONS}
                                    onCreate={() => {}}
                                    value={field.value}
                                    onChange={field.onChange}
                                    disabled={disabled}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button className="w-full" disabled={disabled}>
                    {id ? "Save Changes" : "Create Account"}
                </Button>
                {!!id && (
                    <Button
                        type="button"
                        disabled={disabled}
                        onClick={handleDelete}
                        className="w-full"
                        variant="outline"
                    >
                        <Trash className="size-4" />
                        Delete Account
                    </Button>
                )}
            </form>
        </Form>
    )
}