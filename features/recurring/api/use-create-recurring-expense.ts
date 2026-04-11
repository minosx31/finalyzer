import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.recurring.$post>;
type RequestType = InferRequestType<typeof client.api.recurring.$post>["json"];

export const useCreateRecurringExpense = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>(
        {
            mutationFn: async (json) => {
                const response = await client.api.recurring.$post({ json });

                if (!response.ok) {
                    throw new Error("Failed to create recurring expense");
                }

                return await response.json();
            },
            onSuccess: () => {
                toast.success("Recurring expense created");
                queryClient.invalidateQueries({ queryKey: ["recurring-expenses"] });
            },
            onError: () => {
                toast.error("Failed to create recurring expense");
            },
        }
    );

    return mutation;
};
