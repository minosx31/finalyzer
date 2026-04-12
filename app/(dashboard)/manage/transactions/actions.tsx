"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useDeleteTransaction } from "@/features/transactions/api/index";
import { useConfirm } from "@/hooks/use-confirm";
import { Edit, MoreHorizontal, Trash } from "lucide-react";

type Props = {
    id: string;
}

export const Actions = ({ id }: Props) => {
    const router = useRouter();
    const deleteMutation = useDeleteTransaction(id);
    const [ConfirmDialog, confirm] = useConfirm(
        "Are you sure?",
        "You are about to delete this transaction. This action cannot be undone."
    );
    const handleDelete = async () => {
        const ok = await confirm();
        if (ok) deleteMutation.mutate();
    };

    return (
        <>
            <ConfirmDialog />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="size-8 p-0">
                        <MoreHorizontal className="size-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/manage/transactions/${id}`)}>
                        <Edit className="size-4 mr-2" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={deleteMutation.isPending} onClick={handleDelete}>
                        <Trash className="size-4 mr-2" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};
