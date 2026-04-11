import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useSheet } from "@/hooks/use-sheet";
import { useGetInvestment } from "../api/use-get-investment";
import { useEditInvestment } from "../api/use-edit-investment";
import { useDeleteInvestment } from "../api/use-delete-investment";
import { useConfirm } from "@/hooks/use-confirm";
import { InvestmentForm } from "./investment-form";
import { Loader2 } from "lucide-react";
import { convertAmountFromMiliUnits } from "@/lib/utils";

type Props = { id?: string };

export const EditInvestmentSheet = ({ id }: Props) => {
    const { isOpen, onClose } = useSheet();
    const [ConfirmDialog, confirm] = useConfirm(
        "Are you sure?",
        "This will remove the investment from your portfolio."
    );

    const investmentQuery = useGetInvestment(id);
    const editMutation = useEditInvestment(id);
    const deleteMutation = useDeleteInvestment(id);

    const isPending = editMutation.isPending || deleteMutation.isPending;

    const onSubmit = (values: Parameters<typeof editMutation.mutate>[0]) => {
        editMutation.mutate(values, { onSuccess: () => onClose() });
    };

    const onDelete = async () => {
        const ok = await confirm();
        if (ok) deleteMutation.mutate(undefined, { onSuccess: () => onClose() });
    };

    const inv = investmentQuery.data;
    const defaultValues = inv
        ? {
              ticker: inv.ticker,
              name: inv.name,
              type: inv.type as "stock" | "etf" | "reit" | "bond" | "crypto" | "other",
              exchange: inv.exchange ?? "",
              shares: (inv.shares / 1000).toString(),
              avgCostPrice: convertAmountFromMiliUnits(inv.avgCostPrice).toString(),
              currentPrice: convertAmountFromMiliUnits(inv.currentPrice).toString(),
              currency: inv.currency,
          }
        : undefined;

    return (
        <>
            <ConfirmDialog />
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent className="space-y-4 overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Edit Investment</SheetTitle>
                        <SheetDescription>Update your investment details.</SheetDescription>
                    </SheetHeader>
                    {investmentQuery.isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="size-4 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <InvestmentForm
                            id={id}
                            onSubmit={onSubmit}
                            onDelete={onDelete}
                            disabled={isPending}
                            defaultValues={defaultValues}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
};
