import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.budgets[":id"]["$patch"]>;
type RequestType = InferRequestType<typeof client.api.budgets[":id"]["$patch"]>["json"];

export const useEditBudget = (id?: string) => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api.budgets[":id"]["$patch"]({
                param: { id },
                json,
            });

            if (!response.ok) {
                throw new Error("Failed to edit budget");
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success("Budget updated");
            queryClient.invalidateQueries({ queryKey: ["budgets"] });
            queryClient.invalidateQueries({ queryKey: ["budget", { id }] });
            queryClient.invalidateQueries({ queryKey: ["summary"] });
        },
        onError: () => {
            toast.error("Failed to edit budget");
        },
    });

    return mutation;
};
