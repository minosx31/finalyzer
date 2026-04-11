import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

export const useCreateNetWorthSnapshot = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async () => {
            const response = await client.api["net-worth"].snapshot.$post();

            if (!response.ok) {
                throw new Error("Failed to create snapshot");
            }

            return await response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["net-worth"] });
        },
        onError: () => {
            toast.error("Failed to create net worth snapshot");
        },
    });

    return mutation;
};
