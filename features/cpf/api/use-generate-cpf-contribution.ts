import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.cpf.generate.$post>;

export const useGenerateCPFContribution = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error>({
        mutationFn: async () => {
            const response = await client.api.cpf.generate.$post();

            if (!response.ok) {
                throw new Error("Failed to generate CPF contribution");
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success("CPF contribution generated for this month");
            queryClient.invalidateQueries({ queryKey: ["cpf-account"] });
            queryClient.invalidateQueries({ queryKey: ["cpf-contributions"] });
        },
        onError: (e) => {
            toast.error(e.message || "Failed to generate CPF contribution");
        },
    });

    return mutation;
};
