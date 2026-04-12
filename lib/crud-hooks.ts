/**
 * CRUD Hook Factory
 *
 * Creates a standard set of TanStack Query hooks for a CRUD resource.
 * Each feature calls this once instead of writing 5-6 individual hook files.
 *
 * The factory uses the base API URL and the resource path string rather than
 * the typed Hono RPC client, so the caller provides type parameters for the
 * data shapes. This is a deliberate tradeoff: slightly less automatic type
 * inference in exchange for a dramatically smaller per-feature surface area.
 *
 * Usage:
 *   export const {
 *     useGetAll: useGetGoals,
 *     useGetOne: useGetGoal,
 *     useCreate: useCreateGoal,
 *     useEdit: useEditGoal,
 *     useDelete: useDeleteGoal,
 *     useBulkDelete: useBulkDeleteGoals,
 *   } = createCrudHooks<GoalData, GoalInsert>({
 *     entityName: "goal",
 *     path: "goals",
 *     invalidateOnMutate: ["summary"],
 *   });
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        ...init,
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Request failed");
    }
    return res.json() as Promise<T>;
}

export interface CrudHooksConfig {
    /** Singular lowercase name used in toast messages and query keys. e.g. "goal" */
    entityName: string;
    /** API path segment. e.g. "goals" → /api/goals */
    path: string;
    /** Additional query keys to invalidate on any mutation. e.g. ["summary"] */
    invalidateOnMutate?: string[];
}

export function createCrudHooks<TData, TInsert extends object>(
    config: CrudHooksConfig,
) {
    const { entityName, path, invalidateOnMutate = [] } = config;
    const plural = `${path}`; // used as the list query key

    function invalidateAll(queryClient: ReturnType<typeof useQueryClient>, id?: string) {
        queryClient.invalidateQueries({ queryKey: [plural] });
        if (id) queryClient.invalidateQueries({ queryKey: [entityName, { id }] });
        for (const key of invalidateOnMutate) {
            queryClient.invalidateQueries({ queryKey: [key] });
        }
    }

    function useGetAll() {
        return useQuery<TData[]>({
            queryKey: [plural],
            queryFn: async () => {
                const res = await apiFetch<{ data: TData[] }>(`${BASE_URL}/api/${path}`);
                return res.data;
            },
        });
    }

    function useGetOne(id?: string) {
        return useQuery<TData>({
            enabled: !!id,
            queryKey: [entityName, { id }],
            queryFn: async () => {
                const res = await apiFetch<{ data: TData }>(`${BASE_URL}/api/${path}/${id}`);
                return res.data;
            },
        });
    }

    function useCreate() {
        const queryClient = useQueryClient();
        return useMutation<TData, Error, TInsert>({
            mutationFn: async (json) => {
                const res = await apiFetch<{ data: TData }>(`${BASE_URL}/api/${path}`, {
                    method: "POST",
                    body: JSON.stringify(json),
                });
                return res.data;
            },
            onSuccess: () => {
                toast.success(`${capitalize(entityName)} created`);
                invalidateAll(queryClient);
            },
            onError: (err) => {
                toast.error(err.message || `Failed to create ${entityName}`);
            },
        });
    }

    function useEdit(id?: string) {
        const queryClient = useQueryClient();
        return useMutation<TData, Error, Partial<TInsert>>({
            mutationFn: async (json) => {
                const res = await apiFetch<{ data: TData }>(`${BASE_URL}/api/${path}/${id}`, {
                    method: "PATCH",
                    body: JSON.stringify(json),
                });
                return res.data;
            },
            onSuccess: () => {
                toast.success(`${capitalize(entityName)} updated`);
                invalidateAll(queryClient, id);
            },
            onError: (err) => {
                toast.error(err.message || `Failed to update ${entityName}`);
            },
        });
    }

    function useDelete(id?: string) {
        const queryClient = useQueryClient();
        return useMutation<void, Error>({
            mutationFn: async () => {
                await apiFetch(`${BASE_URL}/api/${path}/${id}`, { method: "DELETE" });
            },
            onSuccess: () => {
                toast.success(`${capitalize(entityName)} deleted`);
                invalidateAll(queryClient, id);
            },
            onError: (err) => {
                toast.error(err.message || `Failed to delete ${entityName}`);
            },
        });
    }

    function useBulkDelete() {
        const queryClient = useQueryClient();
        return useMutation<void, Error, { ids: string[] }>({
            mutationFn: async ({ ids }) => {
                await apiFetch(`${BASE_URL}/api/${path}/bulk-delete`, {
                    method: "POST",
                    body: JSON.stringify({ ids }),
                });
            },
            onSuccess: () => {
                toast.success(`${capitalize(entityName)}s deleted`);
                invalidateAll(queryClient);
            },
            onError: (err) => {
                toast.error(err.message || `Failed to delete ${entityName}s`);
            },
        });
    }

    return { useGetAll, useGetOne, useCreate, useEdit, useDelete, useBulkDelete };
}

function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
