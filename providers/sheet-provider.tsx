"use client";

import { useMountedState } from "react-use";

import { useSheet } from "@/hooks/use-sheet";

import { NewAccountSheet } from "@/features/accounts/components/new-account-sheet";
import { EditAccountSheet } from "@/features/accounts/components/edit-account-sheet";

import { NewCategorySheet } from "@/features/categories/components/new-category-sheet";
import { EditCategorySheet } from "@/features/categories/components/edit-category-sheet";

import { NewTransactionSheet } from "@/features/transactions/components/new-transaction-sheet";
import { EditTransactionSheet } from "@/features/transactions/components/edit-transaction-sheet";

import { NewGoalSheet } from "@/features/goals/components/new-goal-sheet";
import { EditGoalSheet } from "@/features/goals/components/edit-goal-sheet";

import { NewRecurringSheet } from "@/features/recurring/components/new-recurring-sheet";
import { EditRecurringSheet } from "@/features/recurring/components/edit-recurring-sheet";

import { NewBudgetSheet } from "@/features/budgets/components/new-budget-sheet";
import { EditBudgetSheet } from "@/features/budgets/components/edit-budget-sheet";

import { NewInvestmentSheet } from "@/features/investments/components/new-investment-sheet";
import { EditInvestmentSheet } from "@/features/investments/components/edit-investment-sheet";

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

            {type === "new-goal" && <NewGoalSheet />}
            {type === "edit-goal" && <EditGoalSheet id={data.id} />}

            {type === "new-recurring" && <NewRecurringSheet />}
            {type === "edit-recurring" && <EditRecurringSheet id={data.id} />}

            {type === "new-budget" && <NewBudgetSheet />}
            {type === "edit-budget" && <EditBudgetSheet id={data.id} />}

            {type === "new-investment" && <NewInvestmentSheet />}
            {type === "edit-investment" && <EditInvestmentSheet id={data.id} />}
        </>
    )
}