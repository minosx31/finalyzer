import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useSheet } from "@/hooks/use-sheet";
import { useCreateInvestment } from "../api/use-create-investment";
import { InvestmentForm } from "./investment-form";

export const NewInvestmentSheet = () => {
    const { isOpen, onClose } = useSheet();
    const mutation = useCreateInvestment();

    const onSubmit = (values: Parameters<typeof mutation.mutate>[0]) => {
        mutation.mutate(values, { onSuccess: () => onClose() });
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="space-y-4 overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Add Investment</SheetTitle>
                    <SheetDescription>Track a new investment holding in your portfolio.</SheetDescription>
                </SheetHeader>
                <InvestmentForm onSubmit={onSubmit} disabled={mutation.isPending} />
            </SheetContent>
        </Sheet>
    );
};
