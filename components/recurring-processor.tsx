"use client";

import { useEffect } from "react";
import { useProcessRecurring } from "@/features/recurring/api/use-process-recurring";

export const RecurringProcessor = () => {
    const { mutate } = useProcessRecurring();

    useEffect(() => {
        mutate();
    }, []);

    return null;
};
