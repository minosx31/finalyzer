import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetNetWorthHistory = () => {
    const query = useQuery({
        queryKey: ["net-worth"],
        queryFn: async () => {
            const response = await client.api["net-worth"].$get();

            if (!response.ok) {
                throw new Error("Failed to fetch net worth history");
            }

            const { data } = await response.json();
            return data;
        },
    });
    return query;
};
