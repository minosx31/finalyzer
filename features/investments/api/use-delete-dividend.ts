import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.investments.dividends[":id"]["$delete"]>;

export const useDeleteDividend = (id?: string) => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error>({
        mutationFn: async () => {
            const response = await client.api.investments.dividends[":id"]["$delete"]({
                param: { id },
            });

            if (!response.ok) {
                throw new Error("Failed to delete dividend");
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success("Dividend removed");
            queryClient.invalidateQueries({ queryKey: ["dividends"] });
        },
        onError: () => {
            toast.error("Failed to remove dividend");
        },
    });

    return mutation;
};
