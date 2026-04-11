import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.recurring[":id"]["$patch"]>;
type RequestType = InferRequestType<typeof client.api.recurring[":id"]["$patch"]>["json"];

export const useEditRecurringExpense = (id?: string) => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>(
        {
            mutationFn: async (json) => {
                const response = await client.api.recurring[":id"]["$patch"]({
                    param: { id },
                    json
                });

                if (!response.ok) {
                    throw new Error("Failed to edit recurring expense");
                }

                return await response.json();
            },
            onSuccess: () => {
                toast.success("Recurring expense updated");
                queryClient.invalidateQueries({ queryKey: ["recurring-expenses"] });
                queryClient.invalidateQueries({ queryKey: ["recurring-expense", { id }] });
            },
            onError: () => {
                toast.error("Failed to edit recurring expense");
            },
        }
    );

    return mutation;
};
