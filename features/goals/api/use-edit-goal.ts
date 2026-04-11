import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.goals[":id"]["$patch"]>;
type RequestType = InferRequestType<typeof client.api.goals[":id"]["$patch"]>["json"];

export const useEditGoal = (id?: string) => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>(
        {
            mutationFn: async (json) => {
                const response = await client.api.goals[":id"]["$patch"]({
                    param: { id },
                    json
                });

                if (!response.ok) {
                    throw new Error("Failed to edit goal");
                }

                return await response.json();
            },
            onSuccess: () => {
                toast.success("Goal updated");
                queryClient.invalidateQueries({ queryKey: ["goals"] });
                queryClient.invalidateQueries({ queryKey: ["goal", { id }] });
                queryClient.invalidateQueries({ queryKey: ["summary"] });
            },
            onError: () => {
                toast.error("Failed to edit goal");
            },
        }
    );

    return mutation;
};
