import { createCrudHooks } from "@/lib/crud-hooks";

export type GoalData = {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string | null;
};

export type GoalInsert = {
    name: string;
    targetAmount: number;
    currentAmount?: number;
    deadline?: string | null;
};

export const {
    useGetAll: useGetGoals,
    useGetOne: useGetGoal,
    useCreate: useCreateGoal,
    useEdit: useEditGoal,
    useDelete: useDeleteGoal,
    useBulkDelete: useBulkDeleteGoals,
} = createCrudHooks<GoalData, GoalInsert>({
    entityName: "goal",
    path: "goals",
    invalidateOnMutate: ["summary"],
});
