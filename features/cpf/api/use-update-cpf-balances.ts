import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.cpf.$patch>;
type RequestType = InferRequestType<typeof client.api.cpf.$patch>["json"];

export const useUpdateCPFBalances = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api.cpf.$patch({ json });

            if (!response.ok) {
                throw new Error("Failed to update CPF balances");
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success("CPF balances updated");
            queryClient.invalidateQueries({ queryKey: ["cpf-account"] });
        },
        onError: () => {
            toast.error("Failed to update CPF balances");
        },
    });

    return mutation;
};
