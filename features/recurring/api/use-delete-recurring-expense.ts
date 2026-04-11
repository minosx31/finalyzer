import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.recurring[":id"]["$delete"]>;

export const useDeleteRecurringExpense = (id?: string) => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error>(
        {
            mutationFn: async () => {
                const response = await client.api.recurring[":id"]["$delete"]({
                    param: { id }
                });

                if (!response.ok) {
                    throw new Error("Failed to delete recurring expense");
                }

                return await response.json();
            },
            onSuccess: () => {
                toast.success("Recurring expense deleted");
                queryClient.invalidateQueries({ queryKey: ["recurring-expenses"] });
            },
            onError: () => {
                toast.error("Failed to delete recurring expense");
            },
        }
    );

    return mutation;
};
