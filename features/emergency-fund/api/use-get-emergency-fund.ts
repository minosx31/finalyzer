import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetEmergencyFund = () => {
    const query = useQuery({
        queryKey: ["emergency-fund"],
        queryFn: async () => {
            const response = await client.api["emergency-fund"].$get();

            if (!response.ok) {
                throw new Error("Failed to fetch emergency fund");
            }

            const { data } = await response.json();
            return data;
        },
    });
    return query;
};
