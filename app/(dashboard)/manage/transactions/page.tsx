"use client";
import Link from "next/link";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Search, X, Filter } from "lucide-react";
import { columns } from "./columns";
import { useGetTransactions, useBulkCreateTransactions, useBulkDeleteTransactions } from "@/features/transactions/api/index";
import { Skeleton } from "@/components/ui/skeleton";
import { useSelectAccount } from "@/features/accounts/hooks/use-select-account";
import { UploadButton } from "./upload-button";
import { ImportCard } from "./import-card";
import { transactions as transactionSchema } from "@/db/schema";
import { toast } from "sonner";
import { useGetAccounts } from "@/features/accounts/api/index";
import { useGetCategories } from "@/features/categories/api/index";
import {
    ExpandedState,
    Row,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirm } from "@/hooks/use-confirm";
import { Trash, SlidersHorizontal } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { type ResponseType } from "./columns";

enum VARIANTS { LIST = "LIST", IMPORT = "IMPORT" }
const INITIAL_IMPORT_RESULTS = { data: [], errors: [], meta: {} };

const EMPTY_FILTERS = { search: "", accountId: "", categoryId: "", type: "", from: "", to: "" };
type Filters = typeof EMPTY_FILTERS;

const TYPE_OPTIONS = [
    { label: "All Types", value: "" },
    { label: "Income", value: "income" },
    { label: "Expense", value: "expense" },
    { label: "Transfer", value: "transfer" },
];

const TransactionsPage = () => {
    const [AccountDialog, confirm] = useSelectAccount();
    const [variant, setVariant] = useState<VARIANTS>(VARIANTS.LIST);
    const [importResults, setImportResults] = useState<typeof INITIAL_IMPORT_RESULTS>(INITIAL_IMPORT_RESULTS);

    // Draft = what user is editing; applied = what the query uses (only changes on Apply/Clear)
    const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
    const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
    const [page, setPage] = useState(1);

    const setDraftField = (field: keyof Filters) => (value: string) =>
        setDraft((prev) => ({ ...prev, [field]: value }));

    const applyFilters = () => {
        setApplied(draft);
        setPage(1);
    };

    const clearFilters = () => {
        setDraft(EMPTY_FILTERS);
        setApplied(EMPTY_FILTERS);
        setPage(1);
    };

    const hasApplied = Object.values(applied).some(Boolean);
    const hasDraftChanges = JSON.stringify(draft) !== JSON.stringify(applied);

    // TanStack Table state
    const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: true }]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [expanded, setExpanded] = useState<ExpandedState>({});

    const sortBy = sorting[0]?.id ?? "date";
    const sortDir = sorting[0]?.desc ? "desc" : "asc";

    const { data: accountsData = [] } = useGetAccounts();
    const { data: categoriesData = [] } = useGetCategories();

    const transactionsQuery = useGetTransactions({
        from: applied.from,
        to: applied.to,
        accountId: applied.accountId,
        categoryId: applied.categoryId,
        type: applied.type as "income" | "expense" | "transfer" | undefined || undefined,
        search: applied.search,
        page,
        pageSize: 50,
        sortBy,
        sortDir,
    });

    const createTransactions = useBulkCreateTransactions();
    const deleteTransactions = useBulkDeleteTransactions();
    const [ConfirmDialog, confirmDelete] = useConfirm("Are you sure?", "You are about to delete the selected transaction(s). This action cannot be undone.");

    const transactions = transactionsQuery.data?.data ?? [];
    const total = transactionsQuery.data?.total ?? 0;
    const pageSize = 50;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const isDisabled = transactionsQuery.isLoading || deleteTransactions.isPending;

    const table = useReactTable({
        data: transactions,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualSorting: true,
        manualPagination: true,
        onSortingChange: (updater) => {
            setSorting(updater);
            setPage(1);
        },
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onExpandedChange: setExpanded,
        getRowCanExpand: () => true,
        state: { sorting, columnVisibility, rowSelection, expanded },
    });

    const selectedRows = table.getFilteredSelectedRowModel().rows;

    const handleDelete = useCallback(async (rows: Row<ResponseType>[]) => {
        const ok = await confirmDelete();
        if (ok) {
            deleteTransactions.mutate({ ids: rows.map((r) => r.original.id) });
            table.resetRowSelection();
        }
    }, [confirmDelete, deleteTransactions, table]);

    const onUpload = (results: typeof INITIAL_IMPORT_RESULTS) => {
        setImportResults(results);
        setVariant(VARIANTS.IMPORT);
    };

    const onCancelImport = () => {
        setImportResults(INITIAL_IMPORT_RESULTS);
        setVariant(VARIANTS.LIST);
    };

    const onSubmitImport = async (values: typeof transactionSchema.$inferInsert[]) => {
        const selectedAccountId = await confirm();
        if (!selectedAccountId) return toast.error("Please select an account to continue");
        createTransactions.mutate(
            values.map((v) => ({ ...v, accountId: selectedAccountId as string })),
            { onSuccess: onCancelImport }
        );
    };

    if (transactionsQuery.isLoading) {
        return (
            <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
                <Card className="border-none drop-shadow-md">
                    <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
                    <CardContent>
                        <div className="h-[500px] w-full flex items-center justify-center">
                            <Loader2 className="size-6 text-slate-300 animate-spin" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (variant === VARIANTS.IMPORT) {
        return (
            <>
                <AccountDialog />
                <ImportCard data={importResults.data} onCancel={onCancelImport} onSubmit={onSubmitImport} />
            </>
        );
    }

    return (
        <div className="max-w-screen-2xl mx-auto w-full">
            <AccountDialog />
            <ConfirmDialog />
            <Card className="border-none drop-shadow-md">
                <CardHeader className="gap-y-2 md:flex-row md:items-center md:justify-between">
                    <CardTitle className="text-xl">Transactions</CardTitle>
                    <div className="flex flex-col md:flex-row gap-y-2 items-center gap-x-2">
                        <Button size="sm" asChild className="w-full md:w-auto">
                            <Link href="/manage/transactions/new">
                                <Plus className="size-4 mr-2" />Add New
                            </Link>
                        </Button>
                        <UploadButton onUpload={onUpload} />
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filter bar — draft state, applied on button click */}
                    <div className="flex flex-wrap gap-2 mb-4 items-end">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                            <Input
                                placeholder="Search description..."
                                value={draft.search}
                                onChange={(e) => setDraftField("search")(e.target.value)}
                                className="pl-9 w-48"
                            />
                        </div>
                        <select
                            value={draft.accountId}
                            onChange={(e) => setDraftField("accountId")(e.target.value)}
                            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                        >
                            <option value="">All Accounts</option>
                            {accountsData.map((a) => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                        </select>
                        <select
                            value={draft.categoryId}
                            onChange={(e) => setDraftField("categoryId")(e.target.value)}
                            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                        >
                            <option value="">All Categories</option>
                            {categoriesData.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <select
                            value={draft.type}
                            onChange={(e) => setDraftField("type")(e.target.value)}
                            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                        >
                            {TYPE_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                        <Input
                            type="date"
                            value={draft.from}
                            onChange={(e) => setDraftField("from")(e.target.value)}
                            className="w-36"
                        />
                        <Input
                            type="date"
                            value={draft.to}
                            onChange={(e) => setDraftField("to")(e.target.value)}
                            className="w-36"
                        />
                        <Button
                            size="sm"
                            onClick={applyFilters}
                            disabled={!hasDraftChanges}
                            className="gap-1.5"
                        >
                            <Filter className="size-3.5" />Apply
                        </Button>
                        {hasApplied && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5">
                                <X className="size-3.5" />Clear
                            </Button>
                        )}

                        <div className="ml-auto flex items-center gap-2">
                            {selectedRows.length > 0 && (
                                <Button
                                    disabled={isDisabled}
                                    size="sm"
                                    variant="outline"
                                    className="font-normal text-xs"
                                    onClick={() => handleDelete(selectedRows)}
                                >
                                    <Trash className="size-4 mr-2" />
                                    Delete ({selectedRows.length})
                                </Button>
                            )}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <SlidersHorizontal className="size-4 mr-2" />Columns
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {table.getAllColumns().filter((col) => col.getCanHide()).map((col) => (
                                        <DropdownMenuCheckboxItem
                                            key={col.id}
                                            className="capitalize"
                                            checked={col.getIsVisible()}
                                            onCheckedChange={(value) => col.toggleVisibility(!!value)}
                                        >
                                            {col.id}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((hg) => (
                                    <TableRow key={hg.id}>
                                        {hg.headers.map((header) => (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <>
                                            <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                            {row.getIsExpanded() && (
                                                <TableRow key={`${row.id}-expanded`} className="bg-muted/30 hover:bg-muted/30">
                                                    <TableCell colSpan={columns.length} className="px-8 py-3">
                                                        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                                                            {row.original.description && (
                                                                <span><span className="font-medium text-foreground">Description:</span> {row.original.description}</span>
                                                            )}
                                                            {row.original.notes && (
                                                                <span><span className="font-medium text-foreground">Notes:</span> {row.original.notes}</span>
                                                            )}
                                                            {row.original.toAccountId && (
                                                                <span><span className="font-medium text-foreground">To Account:</span> {row.original.toAccountId}</span>
                                                            )}
                                                            {row.original.transferFee != null && row.original.transferFee > 0 && (
                                                                <span><span className="font-medium text-foreground">Transfer Fee:</span> {formatCurrency(row.original.transferFee)}</span>
                                                            )}
                                                            {!row.original.description && !row.original.notes && (
                                                                <span className="italic">No additional details.</span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                            No transactions found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between py-4">
                        <span className="text-sm text-muted-foreground">
                            {selectedRows.length > 0 ? `${selectedRows.length} selected · ` : ""}
                            {total} transaction{total !== 1 ? "s" : ""}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                                Previous
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TransactionsPage;
