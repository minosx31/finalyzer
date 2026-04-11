import { client } from "@/lib/hono";
import { useQuery } from "@tanstack/react-query";

export const useGetRecurringExpense = (id?: string) => {
    const query = useQuery({
        enabled: !!id,
        queryKey: ["recurring-expense", { id }],
        queryFn: async () => {
            const response = await client.api.recurring[":id"].$get({
                param: { id },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch recurring expense");
            }

            const { data } = await response.json();
            return data;
        }
    })

    return query;
}
