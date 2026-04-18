import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { TriangleAlert } from "lucide-react";

type Props = {
    id: string;
    category: string | null;
    categoryId: string | null;
};

export const CategoryColumn = ({ id, category, categoryId }: Props) => {
    const router = useRouter();

    const onClick = () => {
        if (categoryId) {
            router.push(`/manage/categories/${categoryId}`);
        } else {
            router.push(`/manage/transactions/${id}`);
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
    );
};
