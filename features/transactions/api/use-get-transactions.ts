import { client } from "@/lib/hono";
import { convertAmountFromMiliUnits } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface UseGetTransactionsOptions {
    from?: string;
    to?: string;
    accountId?: string;
    categoryId?: string;
    type?: "income" | "expense" | "transfer";
    search?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
}

export const useGetTransactions = (options: UseGetTransactionsOptions = {}) => {
    const { from = "", to = "", accountId = "", categoryId = "", type, search = "", page = 1, pageSize = 50, sortBy = "date", sortDir = "desc" } = options;

    const query = useQuery({
        queryKey: ["transactions", { from, to, accountId, categoryId, type, search, page, pageSize, sortBy, sortDir }],
        queryFn: async () => {
            const response = await client.api.transactions.$get({
                query: {
                    from: from || undefined,
                    to: to || undefined,
                    accountId: accountId || undefined,
                    categoryId: categoryId || undefined,
                    type: type || undefined,
                    search: search || undefined,
                    page: page.toString(),
                    pageSize: pageSize.toString(),
                    sortBy,
                    sortDir,
                }
            });

            if (!response.ok) throw new Error("Failed to fetch transactions");

            const { data, total, page: currentPage, pageSize: currentPageSize } = await response.json();
            return {
                data: data.map((t) => ({
                    ...t,
                    amount: convertAmountFromMiliUnits(t.amount),
                    transferFee: t.transferFee != null ? convertAmountFromMiliUnits(t.transferFee) : null,
                })),
                total,
                page: currentPage,
                pageSize: currentPageSize,
            };
        }
    });

    return query;
};
