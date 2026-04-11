"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Actions } from "./actions";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

export type ResponseType = {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string | null;
}

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
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDown className="ml-2 size-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "targetAmount",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Target
                    <ArrowUpDown className="ml-2 size-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("targetAmount"));
            // Amount is in milliunits, formatCurrency handles standard units? 
            // formatCurrency uses standard Intl.NumberFormat. 
            // In API/Hooks/UI, we treat milliunits as integers. convertAmountFromMiliUnits divides by 1000.
            // If the row data is raw from API, it is milliunits.
            // We should convert here.
            return formatCurrency(amount / 1000);
        }
    },
    {
        accessorKey: "currentAmount",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Current
                    <ArrowUpDown className="ml-2 size-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("currentAmount"));
            return formatCurrency(amount / 1000);
        }
    },
    {
        id: "progress",
        header: "Progress",
        cell: ({ row }) => {
            const current = parseFloat(row.getValue("currentAmount"));
            const target = parseFloat(row.getValue("targetAmount"));
            const percentage = Math.min(100, Math.max(0, (current / target) * 100)); // Clamp 0-100
            
            return (
                <div className="flex items-center gap-x-2 min-w-[100px]">
                    <Progress value={percentage} className="h-2 w-full" />
                    <span className="text-xs text-muted-foreground">{Math.round(percentage)}%</span>
                </div>
            )
        }
    },
    {
        accessorKey: "deadline",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Deadline
                    <ArrowUpDown className="ml-2 size-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const date = row.getValue("deadline") as string | null;
            if (!date) return <span className="text-muted-foreground">-</span>;
            return format(new Date(date), "MMM dd, yyyy");
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <Actions id={row.original.id} />
    }
];
