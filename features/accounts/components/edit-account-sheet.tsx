import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { AccountForm } from "@/features/accounts/components/account-form";
import { useGetAccount } from "@/features/accounts/api/use-get-account";
import { useEditAccount } from "@/features/accounts/api/use-edit-account";
import { useDeleteAccount } from "@/features/accounts/api/use-delete-account";
import { useSheet } from "@/hooks/use-sheet";
import { Loader2 } from "lucide-react";
import { useConfirm } from "@/hooks/use-confirm";
import { convertAmountFromMiliUnits } from "@/lib/utils";
import { insertAccountSchema } from "@/db/schema";
import { z } from "zod";

// We use the same schema as the internal component output for typing
const formSchema = insertAccountSchema.pick({
    name: true,
    type: true,
    creditLimit: true,
    dueDate: true,
    interestRate: true,
});

type FormValues = z.input<typeof formSchema>;

type Props = {
    id?: string;
};

export const EditAccountSheet = ({ id }: Props) => {
    const { isOpen, onClose } = useSheet();

    const [ConfirmDialog, confirm] = useConfirm(
        "Are you sure?",
        "You are about to delete this account. This action cannot be undone."
    );
    
    const accountQuery = useGetAccount(id);

    const editMutation = useEditAccount(id);
    const deleteMutation = useDeleteAccount(id);

    const isPending = editMutation.isPending || deleteMutation.isPending;

    const isLoading = accountQuery.isLoading;

    const onSubmit = (values: FormValues) => {
        editMutation.mutate(values, {
            onSuccess: () => {
                onClose();
            }
        });
    };

    const onDelete = async () => {
        const ok = await confirm();
        if (ok) {
            deleteMutation.mutate(undefined, {
                onSuccess: () => {
                    onClose();
                }
            });
        }
    }

    const defaultValues = accountQuery.data ? {
        name: accountQuery.data.name,
        type: accountQuery.data.type || undefined,
        creditLimit: accountQuery.data.creditLimit 
            ? convertAmountFromMiliUnits(accountQuery.data.creditLimit).toString() 
            : undefined,
        dueDate: accountQuery.data.dueDate 
            ? accountQuery.data.dueDate.toString() 
            : undefined,
        interestRate: accountQuery.data.interestRate 
            ? (accountQuery.data.interestRate / 100).toString() 
            : undefined,
    } : {
        name: "",
        type: undefined,
        creditLimit: undefined,
        dueDate: undefined,
        interestRate: undefined,
    };

    return (
        <>
            <ConfirmDialog />
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent className="space-y-4">
                    <SheetHeader>
                        <SheetTitle>Edit Account</SheetTitle>
                        <SheetDescription>
                            Edit an existing account.
                        </SheetDescription>
                    </SheetHeader>
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="size-4 text-muted-foreground animate-spin" />
                        </div>
                    ) : (
                        <AccountForm
                            id={id}
                            onSubmit={onSubmit}
                            disabled={isPending}
                            defaultValues={defaultValues}
                            onDelete={onDelete}
                        />
                    )}
                </SheetContent>
                </Sheet>
            </>
    )
}