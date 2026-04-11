"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Actions } from "./actions";
import { convertAmountFromMiliUnits, formatCurrency } from "@/lib/utils";

export type ResponseType = {
    id: string;
    categoryId: string | null;
    categoryName: string | null;
    amount: number;
    period: string;
};

export const columns: ColumnDef<ResponseType>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "categoryName",
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Category
                <ArrowUpDown className="ml-2 size-4" />
            </Button>
        ),
        cell: ({ row }) => row.getValue("categoryName") ?? (
            <span className="text-muted-foreground italic">No category</span>
        ),
    },
    {
        accessorKey: "amount",
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Budget Amount
                <ArrowUpDown className="ml-2 size-4" />
            </Button>
        ),
        cell: ({ row }) => formatCurrency(convertAmountFromMiliUnits(row.getValue("amount"))),
    },
    {
        accessorKey: "period",
        header: "Period",
        cell: ({ row }) => (
            <Badge variant="outline" className="capitalize">
                {row.getValue("period")}
            </Badge>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => <Actions id={row.original.id} />,
    },
];
