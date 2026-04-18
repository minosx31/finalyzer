import { useRouter } from "next/navigation";

type Props = {
    account: string;
    accountId: string;
};

export const AccountColumn = ({ account, accountId }: Props) => {
    const router = useRouter();
    return (
        <div
            className="flex items-center cursor-pointer hover:underline"
            onClick={() => router.push(`/manage/accounts/${accountId}`)}
        >
            {account}
        </div>
    );
};
