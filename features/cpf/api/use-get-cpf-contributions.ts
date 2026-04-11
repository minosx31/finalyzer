import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetCPFContributions = () => {
    const query = useQuery({
        queryKey: ["cpf-contributions"],
        queryFn: async () => {
            const response = await client.api.cpf.contributions.$get();

            if (!response.ok) {
                throw new Error("Failed to fetch CPF contributions");
            }

            const { data } = await response.json();
            return data;
        },
    });
    return query;
};
