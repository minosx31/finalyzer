import { useSheet } from "@/hooks/use-sheet";
import { cn } from "@/lib/utils";
import { TriangleAlert } from "lucide-react";

type Props = {
    id: string;
    category: string | null;
    categoryId: string | null;
};

export const CategoryColumn = ({
    id,
    category,
    categoryId,
}: Props) => {
    const { onOpen } = useSheet();

    const onClick = () => {
        if (categoryId) {
            onOpen("edit-category", { id: categoryId });
        } else {
            onOpen("edit-transaction", { id });
        }
    };

    return (
        <div
            className={cn(
                "flex items-center cursor-pointer hover:underline",
                !category && "text-rose-500",
            )}
            onClick={onClick}
        >
            {!category && <TriangleAlert className="mr-2 size-4 shrink-0" />}
            {category || "Uncategorized"}
        </div>
    )
};