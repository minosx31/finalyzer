import { client } from "@/lib/hono";
import { useQuery } from "@tanstack/react-query";

export const useGetRecurringExpenses = () => {
    const query = useQuery({
        queryKey: ["recurring-expenses"],
        queryFn: async () => {
            const response = await client.api.recurring.$get();

            if (!response.ok) {
                throw new Error("Failed to fetch recurring expenses");
            }

            const { data } = await response.json();
            return data;
        }
    })

    return query;
}
