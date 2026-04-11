import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetInvestments = () => {
    const query = useQuery({
        queryKey: ["investments"],
        queryFn: async () => {
            const response = await client.api.investments.$get();

            if (!response.ok) {
                throw new Error("Failed to fetch investments");
            }

            const { data } = await response.json();
            return data;
        },
    });
    return query;
};
