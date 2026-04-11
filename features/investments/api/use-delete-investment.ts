import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.investments[":id"]["$delete"]>;

export const useDeleteInvestment = (id?: string) => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error>({
        mutationFn: async () => {
            const response = await client.api.investments[":id"]["$delete"]({
                param: { id },
            });

            if (!response.ok) {
                throw new Error("Failed to delete investment");
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success("Investment removed");
            queryClient.invalidateQueries({ queryKey: ["investments"] });
        },
        onError: () => {
            toast.error("Failed to remove investment");
        },
    });

    return mutation;
};
