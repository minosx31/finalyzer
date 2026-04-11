import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetForecast = () => {
    const query = useQuery({
        queryKey: ["forecast"],
        queryFn: async () => {
            const response = await client.api.forecast.$get();

            if (!response.ok) {
                throw new Error("Failed to fetch forecast");
            }

            const { data } = await response.json();
            return data;
        },
    });
    return query;
};
