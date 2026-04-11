import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.investments[":id"]["$patch"]>;
type RequestType = InferRequestType<typeof client.api.investments[":id"]["$patch"]>["json"];

export const useEditInvestment = (id?: string) => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api.investments[":id"]["$patch"]({
                param: { id },
                json,
            });

            if (!response.ok) {
                throw new Error("Failed to edit investment");
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success("Investment updated");
            queryClient.invalidateQueries({ queryKey: ["investments"] });
            queryClient.invalidateQueries({ queryKey: ["investment", { id }] });
        },
        onError: () => {
            toast.error("Failed to edit investment");
        },
    });

    return mutation;
};
