"use client"

import { InferResponseType } from "hono"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, ChevronRight } from "lucide-react"
import { client } from "@/lib/hono"
import { Actions } from "./actions"
import { format } from "date-fns"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { AccountColumn } from "./account-column"
import { CategoryColumn } from "./category-column"
import { cn } from "@/lib/utils"

export type ResponseType = InferResponseType<typeof client.api.transactions.$get, 200>["data"][0];

const TYPE_STYLES: Record<string, string> = {
    income: "bg-emerald-100 text-emerald-700",
    expense: "bg-rose-100 text-rose-700",
    transfer: "bg-blue-100 text-blue-700",
};

export const columns: ColumnDef<ResponseType>[] = [
    {
        id: "expand",
        header: () => null,
        cell: ({ row }) => (
            <button
                onClick={() => row.toggleExpanded()}
                className="text-muted-foreground hover:text-foreground transition-colors"
            >
                {row.getIsExpanded()
                    ? <ChevronDown className="size-4" />
                    : <ChevronRight className="size-4" />
                }
            </button>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
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
        accessorKey: "date",
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Date <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => <span>{format(new Date(row.getValue("date")), "dd MMM yyyy")}</span>,
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.getValue("type") as string;
            return (
                <span className={cn("text-xs font-medium px-2 py-1 rounded-full capitalize", TYPE_STYLES[type] ?? "bg-muted text-muted-foreground")}>
                    {type}
                </span>
            );
        },
    },
    {
        accessorKey: "description",
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Description <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("description") || "—"}</span>,
    },
    {
        accessorKey: "category",
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Category <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <CategoryColumn
                id={row.original.id}
                category={row.original.category}
                categoryId={row.original.categoryId}
            />
        ),
    },
    {
        accessorKey: "amount",
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Amount <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const amount = row.getValue("amount") as number;
            const type = row.original.type;
            return (
                <Badge
                    variant={type === "expense" ? "destructive" : "primary"}
                    className="text-xs font-medium px-3.5 py-2.5"
                >
                    {type === "expense" ? "-" : "+"}{formatCurrency(Math.abs(amount))}
                </Badge>
            );
        },
    },
    {
        accessorKey: "account",
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Account <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <AccountColumn account={row.original.account} accountId={row.original.accountId} />
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => <Actions id={row.original.id} />,
    },
]
