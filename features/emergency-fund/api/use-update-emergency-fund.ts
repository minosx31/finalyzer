import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api["emergency-fund"]["$patch"]>;
type RequestType = InferRequestType<typeof client.api["emergency-fund"]["$patch"]>["json"];

export const useUpdateEmergencyFund = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api["emergency-fund"]["$patch"]({ json });

            if (!response.ok) {
                throw new Error("Failed to update emergency fund");
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success("Emergency fund updated");
            queryClient.invalidateQueries({ queryKey: ["emergency-fund"] });
        },
        onError: () => {
            toast.error("Failed to update emergency fund");
        },
    });

    return mutation;
};
