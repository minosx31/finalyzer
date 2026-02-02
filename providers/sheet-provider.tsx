"use client";

import { useMountedState } from "react-use";

import { useSheet } from "@/hooks/use-sheet";

import { NewAccountSheet } from "@/features/accounts/components/new-account-sheet";
import { EditAccountSheet } from "@/features/accounts/components/edit-account-sheet";

import { NewCategorySheet } from "@/features/categories/components/new-category-sheet";
import { EditCategorySheet } from "@/features/categories/components/edit-category-sheet";

import { NewTransactionSheet } from "@/features/transactions/components/new-transaction-sheet";
import { EditTransactionSheet } from "@/features/transactions/components/edit-transaction-sheet";

export const SheetProvider = () => {
    const isMounted = useMountedState();
    const { type, isOpen, data } = useSheet();

    if (!isMounted) return null;

    if (!isOpen) return null;

    return (
        <>
            {type === "new-account" && <NewAccountSheet />}
            {type === "edit-account" && <EditAccountSheet id={data.id} />}

            {type === "new-category" && <NewCategorySheet />}
            {type === "edit-category" && <EditCategorySheet id={data.id} />}

            {type === "new-transaction" && <NewTransactionSheet />}
            {type === "edit-transaction" && <EditTransactionSheet id={data.id} />}
        </>
    )
}