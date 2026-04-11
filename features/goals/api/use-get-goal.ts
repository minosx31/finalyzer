import { client } from "@/lib/hono";
import { useQuery } from "@tanstack/react-query";

export const useGetGoal = (id?: string) => {
    const query = useQuery({
        enabled: !!id,
        queryKey: ["goal", { id }],
        queryFn: async () => {
            const response = await client.api.goals[":id"].$get({
                param: { id },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch goal");
            }

            const { data } = await response.json();
            return data;
        }
    })

    return query;
}
