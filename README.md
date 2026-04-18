# Finalyzer

A modern, full-stack personal finance tracker for managing accounts, transactions, categories, budgets, recurring expenses, goals, and investments.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| UI | React + shadcn/ui + Tailwind CSS |
| Server state | TanStack Query v5 |
| Backend API | Hono (Edge Runtime) |
| Database | PostgreSQL via NeonDB |
| ORM | Drizzle ORM |
| Auth | Clerk |
| Deployment | Vercel |

---

## Architecture Revamp

The original codebase used a **sheet-modal pattern** for all create/edit flows. Every new feature required ~13 files of wiring: a new-sheet component, an edit-sheet component, type registrations in a global `use-sheet` Zustand store, a sheet-provider conditional render, an `actions.tsx` dropdown, a `columns.tsx` definition, and 5–6 individual hook files.

The revamp replaces this with two improvements:

### 1. Detail Page Pattern (replaces sheets)

Every feature now has three pages:

```
app/(dashboard)/[section]/[feature]/
├── page.tsx          ← list view (cards or DataTable)
├── new/page.tsx      ← create form page
└── [id]/page.tsx     ← detail page: view + inline edit + delete
```

- **List page** — shows entities as cards or a table. "Add" button navigates to `/new`. Clicking an item navigates to `/[id]`.
- **Create page** (`/new`) — renders the feature's form. On success, redirects back to the list.
- **Detail page** (`/[id]`) — shows entity data. Edit button toggles an inline form (same form component). Delete button with a confirmation dialog.

The entire `use-sheet` Zustand store, `SheetProvider`, and all `new-*-sheet` / `edit-*-sheet` components were deleted.

**New feature cost: ~7 files** (all genuinely feature-specific — no mechanical wiring).

### 2. CRUD Hook Factory (`lib/crud-hooks.ts`)

Instead of writing 5–6 nearly identical hook files per feature, a factory function produces all of them from a single declaration:

```ts
// features/goals/api/index.ts
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
```

### Before vs After

| What | Before | After |
|------|--------|-------|
| Hook files per feature | 5–6 | 1 |
| Sheet components per feature | 2 | 0 |
| `use-sheet` / `SheetProvider` wiring | Yes | Deleted |
| `actions.tsx` per feature | Yes | Deleted (edit/delete live on detail page) |
| `columns.tsx` for card-based lists | Yes | Deleted |
| **Total files per new feature** | **~13** | **~7** |

---

## CRUD Hook Factory

### `createCrudHooks<TData, TInsert>(config)`

Defined in `lib/crud-hooks.ts`. Call it once per feature to get all standard hooks.

**Config:**

| Option | Type | Description |
|--------|------|-------------|
| `entityName` | `string` | Singular name used in toast messages and query keys. e.g. `"goal"` |
| `path` | `string` | API path segment. e.g. `"goals"` → calls `/api/goals` |
| `invalidateOnMutate` | `string[]` | Extra query keys to invalidate on any mutation. e.g. `["summary"]` |

**Returned hooks:**

| Hook | Signature | Description |
|------|-----------|-------------|
| `useGetAll` | `() → Query<TData[]>` | Fetches the full list. Query key: `[path]`. |
| `useGetOne` | `(id?: string) → Query<TData>` | Fetches a single entity by id. Disabled when `id` is undefined. Query key: `[entityName, { id }]`. |
| `useCreate` | `() → Mutation<TData, TInsert>` | POSTs to `/api/{path}`. Shows a success/error toast and invalidates the list. |
| `useEdit` | `(id?: string) → Mutation<TData, Partial<TInsert>>` | PATCHes to `/api/{path}/{id}`. Invalidates both the list and the single-entity query. |
| `useDelete` | `(id?: string) → Mutation<void>` | DELETEs `/api/{path}/{id}`. |
| `useBulkDelete` | `() → Mutation<void, { ids: string[] }>` | POSTs to `/api/{path}/bulk-delete`. |

**Usage in components:**

```tsx
// Read
const { data: goals, isLoading } = useGetGoals();
const { data: goal } = useGetGoal(id);

// Create
const createGoal = useCreateGoal();
createGoal.mutate({ name: "Emergency Fund", targetAmount: 10000000 });

// Edit
const editGoal = useEditGoal(id);
editGoal.mutate({ name: "Updated Name" }, { onSuccess: () => setIsEditing(false) });

// Delete
const deleteGoal = useDeleteGoal(id);
deleteGoal.mutate(undefined, { onSuccess: () => router.push("/manage/goals") });
```

> **Note:** Transactions use the Hono typed client directly (`features/transactions/api/`) because they have complex query params (date range, account filter). The factory uses plain `fetch` and is not suitable for routes with non-trivial query logic.

---

## Adding a New Feature

### Step 1 — Database schema (`db/schema.ts`)

Add a new table. Use `bigint("col", { mode: "number" })` for monetary columns (stored as milliunits × 1000).

```ts
export const widgets = pgTable("widgets", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    amount: bigint("amount", { mode: "number" }).notNull(), // milliunits
    createdAt: timestamp("created_at").defaultNow(),
});
export const insertWidgetSchema = createInsertSchema(widgets);
```

Run `bun run db:generate` then `bun run db:migrate`.

### Step 2 — Hono API route (`app/api/[[...route]]/widgets.ts`)

```ts
import { Hono } from "hono";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { db } from "@/db/drizzle";
import { widgets, insertWidgetSchema } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";

const app = new Hono()
    .get("/", clerkMiddleware(), async (c) => {
        const { userId } = getAuth(c)!;
        const data = await db.select().from(widgets).where(eq(widgets.userId, userId));
        return c.json({ data });
    })
    .get("/:id", clerkMiddleware(), async (c) => {
        const { userId } = getAuth(c)!;
        const { id } = c.req.param();
        const [data] = await db.select().from(widgets)
            .where(and(eq(widgets.id, id), eq(widgets.userId, userId)));
        if (!data) return c.json({ error: "Not found" }, 404);
        return c.json({ data });
    })
    .post("/", clerkMiddleware(), zValidator("json", insertWidgetSchema.omit({ id: true, userId: true })), async (c) => {
        const { userId } = getAuth(c)!;
        const values = c.req.valid("json");
        const [data] = await db.insert(widgets).values({ id: createId(), userId, ...values }).returning();
        return c.json({ data });
    })
    .patch("/:id", clerkMiddleware(), zValidator("json", insertWidgetSchema.omit({ id: true, userId: true }).partial()), async (c) => {
        const { userId } = getAuth(c)!;
        const { id } = c.req.param();
        const values = c.req.valid("json");
        const [data] = await db.update(widgets).set(values)
            .where(and(eq(widgets.id, id), eq(widgets.userId, userId))).returning();
        if (!data) return c.json({ error: "Not found" }, 404);
        return c.json({ data });
    })
    .delete("/:id", clerkMiddleware(), async (c) => {
        const { userId } = getAuth(c)!;
        const { id } = c.req.param();
        await db.delete(widgets).where(and(eq(widgets.id, id), eq(widgets.userId, userId)));
        return c.json({ data: { id } });
    });

export default app;
```

Register in `app/api/[[...route]]/route.ts`:

```ts
import widgets from "./widgets";
const app = new Hono().basePath("/api")
    // ...existing routes...
    .route("/widgets", widgets);
```

### Step 3 — API hooks (`features/widgets/api/index.ts`)

```ts
import { createCrudHooks } from "@/lib/crud-hooks";

export type WidgetData = {
    id: string;
    name: string;
    amount: number;
};

export type WidgetInsert = {
    name: string;
    amount: number;
};

export const {
    useGetAll: useGetWidgets,
    useGetOne: useGetWidget,
    useCreate: useCreateWidget,
    useEdit: useEditWidget,
    useDelete: useDeleteWidget,
    useBulkDelete: useBulkDeleteWidgets,
} = createCrudHooks<WidgetData, WidgetInsert>({
    entityName: "widget",
    path: "widgets",
    invalidateOnMutate: ["summary"], // add any query keys to refresh on mutation
});
```

### Step 4 — Form component (`features/widgets/components/widget-form.tsx`)

A standard React Hook Form + zod form. It should:
- Accept `defaultValues` for the edit case
- Accept `onSubmit: (values: ApiValues) => void`
- Convert display values (e.g. string `"25.00"`) to storage values (milliunits `25000`) before calling `onSubmit`

### Step 5 — Pages

**List page** (`app/(dashboard)/manage/widgets/page.tsx`):

```tsx
"use client";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetWidgets } from "@/features/widgets/api/index";

const WidgetsPage = () => {
    const { data: widgets, isLoading } = useGetWidgets();
    if (isLoading) return <div>Loading...</div>;
    return (
        <div className="max-w-screen-2xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Widgets</h1>
                <Button asChild size="sm">
                    <Link href="/manage/widgets/new"><Plus className="size-4 mr-2" />Add Widget</Link>
                </Button>
            </div>
            {/* render widget cards, link each to /manage/widgets/${widget.id} */}
        </div>
    );
};
export default WidgetsPage;
```

**Create page** (`app/(dashboard)/manage/widgets/new/page.tsx`):

```tsx
"use client";
import { useRouter } from "next/navigation";
import { WidgetForm } from "@/features/widgets/components/widget-form";
import { useCreateWidget } from "@/features/widgets/api/index";

const NewWidgetPage = () => {
    const router = useRouter();
    const createWidget = useCreateWidget();
    return (
        <WidgetForm
            onSubmit={(values) => createWidget.mutate(values, {
                onSuccess: () => router.push("/manage/widgets"),
            })}
            disabled={createWidget.isPending}
        />
    );
};
export default NewWidgetPage;
```

**Detail page** (`app/(dashboard)/manage/widgets/[id]/page.tsx`):

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetWidget, useEditWidget, useDeleteWidget } from "@/features/widgets/api/index";
import { useConfirm } from "@/hooks/use-confirm";

type Props = { params: { id: string } };  // plain object in Next.js 14 — NOT Promise

const WidgetDetailPage = ({ params }: Props) => {
    const { id } = params;   // ← destructure directly, do NOT use use(params)
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const { data: widget, isLoading } = useGetWidget(id);
    const editWidget = useEditWidget(id);
    const deleteWidget = useDeleteWidget(id);
    const [ConfirmDialog, confirm] = useConfirm("Delete Widget", "This cannot be undone.");

    const handleDelete = async () => {
        const ok = await confirm();
        if (ok) deleteWidget.mutate(undefined, { onSuccess: () => router.push("/manage/widgets") });
    };

    if (isLoading) return <div>Loading...</div>;
    if (!widget) return <div>Not found.</div>;

    return (
        <>
            <ConfirmDialog />
            {/* show widget data, edit toggle, delete button */}
        </>
    );
};
export default WidgetDetailPage;
```

> **Important:** In Next.js 14, `params` is a plain synchronous object — **do not** wrap it in `use(params)`. That pattern is Next.js 15+ only and will throw "unsupported type was passed to use()" at runtime.

---

## Project Structure

```
app/
  (dashboard)/
    manage/
      accounts/         page.tsx · new/page.tsx · [id]/page.tsx
      categories/       page.tsx · new/page.tsx · [id]/page.tsx
      goals/            page.tsx · new/page.tsx · [id]/page.tsx
      recurring/        page.tsx · new/page.tsx · [id]/page.tsx
      transactions/     page.tsx · new/page.tsx · [id]/page.tsx
    investments/        page.tsx · new/page.tsx · [id]/page.tsx
    planning/
      budgets/          page.tsx · new/page.tsx · [id]/page.tsx
  api/[[...route]]/     Hono route handlers (one file per feature)
features/
  accounts/api/index.ts     CRUD hooks via factory
  goals/api/index.ts
  categories/api/index.ts
  budgets/api/index.ts
  recurring/api/index.ts
  investments/api/index.ts
  transactions/api/           Hono-typed hooks (complex query params)
  */components/               Form components shared by new + detail pages
lib/
  crud-hooks.ts       createCrudHooks factory
  hono.ts             Hono RPC client (typed API calls for transactions)
  utils.ts            convertAmountFromMiliUnits · convertAmountToMiliUnits · formatSGD
db/
  schema.ts           Drizzle table definitions
drizzle/              Generated SQL migrations
hooks/
  use-confirm.tsx     Confirmation dialog hook
```

---

## Monetary Values

All monetary amounts are stored as **milliunits** (integer × 1000) to avoid floating-point precision issues.

| Operation | Utility |
|-----------|---------|
| Display (e.g. $25.50) | `convertAmountFromMiliUnits(amount)` → divides by 1000 |
| Store (e.g. user inputs "25.50") | `convertAmountToMiliUnits(value)` → multiplies by 1000 |
| Format as SGD string | `formatSGD(amount)` (after converting from milliunits) |

Monetary columns in the schema use `bigint("col", { mode: "number" })` — PostgreSQL `bigint` returned as a JavaScript `number`.

---

## Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Hono Documentation](https://hono.dev/docs/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Clerk Documentation](https://clerk.com/docs)
- [NeonDB](https://neon.tech/)
- [Next.js 14 App Router](https://nextjs.org/docs/app)
