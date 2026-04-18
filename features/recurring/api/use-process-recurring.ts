import { client } from "@/lib/hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useProcessRecurring = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const res = await client.api.recurring["process"].$post();
            if (!res.ok) throw new Error("Failed to process recurring expenses");
            return res.json();
        },
        onSuccess: ({ generated }) => {
            if (generated > 0) {
                queryClient.invalidateQueries({ queryKey: ["transactions"] });
                queryClient.invalidateQueries({ queryKey: ["summary"] });
            }
        },
    });
};
