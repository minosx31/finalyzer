import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.investments.$post>;
type RequestType = InferRequestType<typeof client.api.investments.$post>["json"];

export const useCreateInvestment = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api.investments.$post({ json });

            if (!response.ok) {
                throw new Error("Failed to create investment");
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success("Investment added");
            queryClient.invalidateQueries({ queryKey: ["investments"] });
        },
        onError: () => {
            toast.error("Failed to add investment");
        },
    });

    return mutation;
};
