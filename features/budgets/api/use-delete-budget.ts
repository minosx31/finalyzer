import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.budgets[":id"]["$delete"]>;

export const useDeleteBudget = (id?: string) => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error>({
        mutationFn: async () => {
            const response = await client.api.budgets[":id"]["$delete"]({
                param: { id },
            });

            if (!response.ok) {
                throw new Error("Failed to delete budget");
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success("Budget deleted");
            queryClient.invalidateQueries({ queryKey: ["budgets"] });
            queryClient.invalidateQueries({ queryKey: ["summary"] });
        },
        onError: () => {
            toast.error("Failed to delete budget");
        },
    });

    return mutation;
};
