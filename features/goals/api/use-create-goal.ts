import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.goals.$post>;
type RequestType = InferRequestType<typeof client.api.goals.$post>["json"];

export const useCreateGoal = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>(
        {
            mutationFn: async (json) => {
                const response = await client.api.goals.$post({ json });

                if (!response.ok) {
                    throw new Error("Failed to create goal");
                }

                return await response.json();
            },
            onSuccess: () => {
                toast.success("Goal created");
                queryClient.invalidateQueries({ queryKey: ["goals"] });
                queryClient.invalidateQueries({ queryKey: ["summary"] }); // Refresh dashboard summary too
            },
            onError: () => {
                toast.error("Failed to create goal");
            },
        }
    );

    return mutation;
};
