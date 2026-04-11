import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.investments.dividends.$post>;
type RequestType = InferRequestType<typeof client.api.investments.dividends.$post>["json"];

export const useCreateDividend = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api.investments.dividends.$post({ json });

            if (!response.ok) {
                throw new Error("Failed to record dividend");
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success("Dividend recorded");
            queryClient.invalidateQueries({ queryKey: ["dividends"] });
        },
        onError: () => {
            toast.error("Failed to record dividend");
        },
    });

    return mutation;
};
