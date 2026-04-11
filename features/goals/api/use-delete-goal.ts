import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.goals[":id"]["$delete"]>;

export const useDeleteGoal = (id?: string) => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error>(
        {
            mutationFn: async () => {
                const response = await client.api.goals[":id"]["$delete"]({
                    param: { id }
                });

                if (!response.ok) {
                    throw new Error("Failed to delete goal");
                }

                return await response.json();
            },
            onSuccess: () => {
                toast.success("Goal deleted");
                queryClient.invalidateQueries({ queryKey: ["goals"] });
                queryClient.invalidateQueries({ queryKey: ["summary"] });
            },
            onError: () => {
                toast.error("Failed to delete goal");
            },
        }
    );

    return mutation;
};
