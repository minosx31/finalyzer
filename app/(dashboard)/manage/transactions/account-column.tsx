import { useSheet } from "@/hooks/use-sheet";

type Props = {
    account: string;
    accountId: string;
};

export const AccountColumn = ({
    account,
    accountId,
}: Props) => {
    const { onOpen } = useSheet();

    const onClick = () => {
        onOpen("edit-account", { id: accountId });
    };

    return (
        <div
            className="flex items-center cursor-pointer hover:underline"
            onClick={onClick}
        >
            {account}
        </div>
    )
};