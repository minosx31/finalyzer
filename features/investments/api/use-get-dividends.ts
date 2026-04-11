import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetDividends = () => {
    const query = useQuery({
        queryKey: ["dividends"],
        queryFn: async () => {
            const response = await client.api.investments.dividends.$get();

            if (!response.ok) {
                throw new Error("Failed to fetch dividends");
            }

            const { data } = await response.json();
            return data;
        },
    });
    return query;
};
