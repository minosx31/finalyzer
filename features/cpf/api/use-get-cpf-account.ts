import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetCPFAccount = () => {
    const query = useQuery({
        queryKey: ["cpf-account"],
        queryFn: async () => {
            const response = await client.api.cpf.$get();

            if (!response.ok) {
                throw new Error("Failed to fetch CPF account");
            }

            const { data } = await response.json();
            return data;
        },
    });
    return query;
};
