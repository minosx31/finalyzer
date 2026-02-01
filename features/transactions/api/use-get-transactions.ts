import { client } from "@/lib/hono";
import { convertAmountFromMiliUnits } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

interface UseGetTransactionsOptions {
    limit?: number;
}

export const useGetTransactions = (options: UseGetTransactionsOptions = {}) => {
    const params = useSearchParams();
    const from = params.get("from") || "";
    const to = params.get("to") || "";
    const accountId = params.get("accountId") || "";
    const { limit } = options;

    const query = useQuery({
        queryKey: ["transactions", { from, to, accountId, limit }],
        queryFn: async () => {
            const response = await client.api.transactions.$get({
                query: {
                    from,
                    to,
                    accountId,
                    limit: limit ? limit.toString() : undefined
                }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch transactions");
            }

            const { data } = await response.json();
            return data.map((transaction) => ({
                ...transaction,
                amount: convertAmountFromMiliUnits(transaction.amount),
            }));
        }
    })

    return query;
}