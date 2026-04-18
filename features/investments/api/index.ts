import { createCrudHooks } from "@/lib/crud-hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type InvestmentData = {
    id: string;
    userId: string;
    accountId: string | null;
    ticker: string;
    name: string;
    type: string;
    exchange: string | null;
    shares: number;
    avgCostPrice: number;
    currentPrice: number;
    currency: string;
};

export type InvestmentInsert = {
    ticker: string;
    name: string;
    type: string;
    exchange?: string | null;
    shares: number;
    avgCostPrice: number;
    currentPrice: number;
    currency: string;
    accountId?: string | null;
};

export type DividendData = {
    id: string;
    investmentId: string | null;
    investmentName: string | null;
    ticker: string | null;
    amount: number;
    date: string;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export const {
    useGetAll: useGetInvestments,
    useGetOne: useGetInvestment,
    useCreate: useCreateInvestment,
    useEdit: useEditInvestment,
    useDelete: useDeleteInvestment,
} = createCrudHooks<InvestmentData, InvestmentInsert>({
    entityName: "investment",
    path: "investments",
});

export const useGetDividends = () =>
    useQuery<DividendData[]>({
        queryKey: ["dividends"],
        queryFn: async () => {
            const res = await fetch(`${BASE_URL}/api/investments/dividends`);
            const json = await res.json();
            return json.data;
        },
    });

export const useCreateDividend = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, { investmentId: string; amount: number; date: string }>({
        mutationFn: async (json) => {
            await fetch(`${BASE_URL}/api/investments/dividends`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(json),
            });
        },
        onSuccess: () => {
            toast.success("Dividend recorded");
            queryClient.invalidateQueries({ queryKey: ["dividends"] });
        },
        onError: () => toast.error("Failed to record dividend"),
    });
};

export const useDeleteDividend = (id?: string) => {
    const queryClient = useQueryClient();
    return useMutation<void, Error>({
        mutationFn: async () => {
            await fetch(`${BASE_URL}/api/investments/dividends/${id}`, { method: "DELETE" });
        },
        onSuccess: () => {
            toast.success("Dividend removed");
            queryClient.invalidateQueries({ queryKey: ["dividends"] });
        },
        onError: () => toast.error("Failed to remove dividend"),
    });
};
