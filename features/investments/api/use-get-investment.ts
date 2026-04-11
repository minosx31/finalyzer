import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetInvestment = (id?: string) => {
    const query = useQuery({
        enabled: !!id,
        queryKey: ["investment", { id }],
        queryFn: async () => {
            const response = await client.api.investments[":id"].$get({
                param: { id },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch investment");
            }

            const { data } = await response.json();
            return data;
        },
    });
    return query;
};
