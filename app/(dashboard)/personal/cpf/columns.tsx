"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { convertAmountFromMiliUnits, formatSGD } from "@/lib/utils";

export type ContributionRow = {
    id: string;
    monthLabel: string;
    grossSalary: number;
    employeeContribution: number;
    employerContribution: number;
    oaAmount: number;
    saAmount: number;
    maAmount: number;
    raAmount: number;
};

export const columns: ColumnDef<ContributionRow>[] = [
    {
        accessorKey: "monthLabel",
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Month
                <ArrowUpDown className="ml-2 size-4" />
            </Button>
        ),
    },
    {
        accessorKey: "grossSalary",
        header: "Gross Salary",
        cell: ({ row }) => formatSGD(convertAmountFromMiliUnits(row.getValue("grossSalary"))),
    },
    {
        accessorKey: "employeeContribution",
        header: "Employee CPF",
        cell: ({ row }) => formatSGD(convertAmountFromMiliUnits(row.getValue("employeeContribution"))),
    },
    {
        accessorKey: "employerContribution",
        header: "Employer CPF",
        cell: ({ row }) => formatSGD(convertAmountFromMiliUnits(row.getValue("employerContribution"))),
    },
    {
        accessorKey: "oaAmount",
        header: "OA",
        cell: ({ row }) => formatSGD(convertAmountFromMiliUnits(row.getValue("oaAmount"))),
    },
    {
        accessorKey: "saAmount",
        header: "SA",
        cell: ({ row }) => formatSGD(convertAmountFromMiliUnits(row.getValue("saAmount"))),
    },
    {
        accessorKey: "maAmount",
        header: "MA",
        cell: ({ row }) => formatSGD(convertAmountFromMiliUnits(row.getValue("maAmount"))),
    },
];
