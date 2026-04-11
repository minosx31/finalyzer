"use client";

import { InferResponseType } from "hono";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";
import { client } from "@/lib/hono";
import { convertAmountFromMiliUnits } from "@/lib/utils";
import { InvestmentActions } from "./actions";

export type InvestmentRow = InferResponseType<typeof client.api.investments.$get, 200>["data"][0];

function formatPrice(milli: number, currency: string) {
    return new Intl.NumberFormat("en-SG", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
    }).format(convertAmountFromMiliUnits(milli));
}

export const investmentColumns: ColumnDef<InvestmentRow>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(v) => row.toggleSelected(!!v)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "ticker",
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Ticker <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <span className="font-mono font-semibold">{row.original.ticker}</span>
                {row.original.exchange && (
                    <span className="text-xs text-muted-foreground">{row.original.exchange}</span>
                )}
            </div>
        ),
    },
    {
        accessorKey: "name",
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Name <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => <span className="max-w-[180px] truncate block">{row.original.name}</span>,
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
            <Badge variant="outline" className="capitalize text-xs">
                {row.original.type}
            </Badge>
        ),
    },
    {
        accessorKey: "shares",
        header: "Shares",
        cell: ({ row }) => (
            <span className="tabular-nums">{(row.original.shares / 1000).toFixed(3)}</span>
        ),
    },
    {
        id: "avgCost",
        header: "Avg Cost",
        cell: ({ row }) => formatPrice(row.original.avgCostPrice, row.original.currency),
    },
    {
        id: "currentPrice",
        header: "Current Price",
        cell: ({ row }) => formatPrice(row.original.currentPrice, row.original.currency),
    },
    {
        id: "marketValue",
        header: "Market Value",
        cell: ({ row }) => {
            const shares = row.original.shares / 1000;
            const price = convertAmountFromMiliUnits(row.original.currentPrice);
            const value = shares * price;
            return (
                <span className="font-medium tabular-nums">
                    {new Intl.NumberFormat("en-SG", {
                        style: "currency",
                        currency: row.original.currency,
                        minimumFractionDigits: 2,
                    }).format(value)}
                </span>
            );
        },
    },
    {
        id: "gainLoss",
        header: "Gain / Loss",
        cell: ({ row }) => {
            const shares = row.original.shares / 1000;
            const cost = convertAmountFromMiliUnits(row.original.avgCostPrice);
            const price = convertAmountFromMiliUnits(row.original.currentPrice);
            const pct = cost > 0 ? ((price - cost) / cost) * 100 : 0;
            const isPositive = pct >= 0;
            return (
                <span className={`tabular-nums font-medium ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                    {isPositive ? "+" : ""}{pct.toFixed(2)}%
                    <span className="block text-xs font-normal text-muted-foreground">
                        {new Intl.NumberFormat("en-SG", {
                            style: "currency",
                            currency: row.original.currency,
                            minimumFractionDigits: 2,
                        }).format(shares * (price - cost))}
                    </span>
                </span>
            );
        },
    },
    {
        accessorKey: "currency",
        header: "Currency",
        cell: ({ row }) => (
            <Badge variant="secondary" className="text-xs">{row.original.currency}</Badge>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => <InvestmentActions id={row.original.id} />,
    },
];
