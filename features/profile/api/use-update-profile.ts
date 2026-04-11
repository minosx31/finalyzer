import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.profile.$patch>;
type RequestType = InferRequestType<typeof client.api.profile.$patch>["json"];

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api.profile.$patch({ json });

            if (!response.ok) {
                throw new Error("Failed to update profile");
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success("Profile updated");
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
        onError: () => {
            toast.error("Failed to update profile");
        },
    });

    return mutation;
};
