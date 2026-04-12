import { createCrudHooks } from "@/lib/crud-hooks";

export type CategoryData = {
    id: string;
    name: string;
};

export type CategoryInsert = {
    name: string;
};

export const {
    useGetAll: useGetCategories,
    useGetOne: useGetCategory,
    useCreate: useCreateCategory,
    useEdit: useEditCategory,
    useDelete: useDeleteCategory,
    useBulkDelete: useBulkDeleteCategories,
} = createCrudHooks<CategoryData, CategoryInsert>({
    entityName: "category",
    path: "categories",
    invalidateOnMutate: ["transactions", "summary"],
});
