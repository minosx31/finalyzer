# Finalyzer

A modern, full-stack finance tracker designed to help you manage income and expenses, categorize transactions, and visualize your financial health.

## Key Features

-   Financial dashboard with various chart types
-   Account and date filters for granular analysis
-   Transaction import from CSV files
-   Secure authentication via Clerk and Google OAuth
-   Type-safe backend API built with Hono
-   PostgreSQL database with Drizzle ORM
-   Deployed on Vercel's high-performance Edge Network

## Tech Stack & Architecture

This project utilizes a modern, type-safe, full-stack architecture that ensures a seamless and robust connection between the frontend and backend.

*   **Frontend (Client-Side):** Built with **Next.js** and **React**, using **shadcn/ui** for components and **Tailwind CSS** for styling. Client-side state and data fetching are managed by **TanStack Query** and **Zustand**.

*   **Backend (Server-Side):** The API is built with **Hono**, a lightweight and fast web framework. It runs on the **Vercel Edge Runtime** for high performance. The database is **PostgreSQL**, managed by **NeonDB**, and **Drizzle ORM** is used as a type-safe bridge between the application and the database.

### The Request Flow

The magic of this stack is in the end-to-end type safety provided by Hono's RPC (Remote Procedure Call) client. Here’s how a typical data request works:

1.  **Component Layer:** A React component in the `app/(dashboard)` directory needs data (e.g., a list of transactions).
2.  **Frontend Hook Layer (`features/.../api`):** The component calls a custom hook, like `useGetTransactions()`. This hook, powered by TanStack Query, manages the data's lifecycle (fetching, caching, loading states, errors).
3.  **Hono RPC Client (`lib/hono.ts`):** The hook uses the Hono client to make a type-safe call to the backend. This feels like calling a local function, but it's actually sending an HTTP request to the server.
4.  **Backend API Layer (`app/api/...`):** The Hono server receives the request. It uses **Clerk** middleware to authenticate the user.
5.  **Database Layer (`db/`):** The Hono route handler then uses **Drizzle ORM** to build a SQL query and fetch the requested data from the PostgreSQL database in a fully type-safe manner.
6.  **The Return Trip:** The data flows back through the same chain, with TypeScript ensuring type safety at every step, from the database all the way to the props of the React component.

This architecture separates concerns cleanly, keeping backend logic isolated from frontend state management, which makes the application highly scalable and maintainable.

## Project Structure

This project follows a feature-sliced architecture to keep the codebase organized and maintainable.

-   **`/app`**: The core of the Next.js application, using the App Router.
    -   **`/app/(auth)`**: Routes for authentication (sign-in, sign-up).
    -   **`/app/(dashboard)`**: The main application routes after a user is logged in.
    -   **`/app/api`**: The backend API layer, built with Hono, which provides type-safe RPC calls.
-   **`/components`**: Shared, reusable React components used across the application.
    -   **`/components/ui`**: UI primitive components from `shadcn/ui`.
-   **`/db`**: Contains the database schema (`schema.ts`) defined with Drizzle ORM.
-   **`/drizzle`**: Stores auto-generated SQL migration files from Drizzle Kit.
-   **`/features`**: Contains "feature slices." Each feature (e.g., transactions, accounts) has its own folder with related hooks, API calls, and components.
-   **`/hooks`**: Global React hooks that can be shared across different features.
-   **`/lib`**: Utility functions and helper modules, including the Hono client setup.
-   **`/providers`**: React Context providers for managing global state (e.g., React Query, sheet components).
-   **`/scripts`**: Standalone scripts for tasks like seeding the database.

## Database Schema

### `accounts` table

| Column      | Data Type | Constraints           | Description                               |
| :---------- | :-------- | :-------------------- | :---------------------------------------- |
| `id`        | `text`    | Primary Key           | Unique identifier for the account.        |
| `name`      | `text`    | Not Null              | Name of the account (e.g., "Checking").   |
| `user_id`   | `text`    | Not Null              | ID of the user who owns the account.      |
| `plaid_id`  | `text`    | Nullable              | Optional ID from Plaid service.           |

### `categories` table

| Column      | Data Type | Constraints           | Description                               |
| :---------- | :-------- | :-------------------- | :---------------------------------------- |
| `id`        | `text`    | Primary Key           | Unique identifier for the category.       |
| `name`      | `text`    | Not Null              | Name of the category (e.g., "Groceries"). |
| `user_id`   | `text`    | Not Null              | ID of the user who owns the category.     |
| `plaid_id`  | `text`    | Nullable              | Optional ID from Plaid service.           |

### `transactions` table

| Column        | Data Type   | Constraints             | Description                               |
| :------------ | :---------- | :---------------------- | :---------------------------------------- |
| `id`          | `text`      | Primary Key             | Unique identifier for the transaction.    |
| `amount`      | `integer`   | Not Null                | Transaction amount in miliunits.          |
| `payee`       | `text`      | Not Null                | The recipient of the payment.             |
| `notes`       | `text`      | Nullable                | User-provided notes for the transaction.  |
| `date`        | `timestamp` | Not Null                | Date of the transaction.                  |
| `account_id`  | `text`      | Not Null, Foreign Key   | Links to the `accounts` table.            |
| `category_id` | `text`      | Nullable, Foreign Key   | Links to the `categories` table.          |

## Resources

-   [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
-   [Hono Documentation](https://hono.dev/docs/)
-   [Clerk Documentation](https://clerk.com/docs)
-   [NeonDB](https://neon.tech/)
-   [Next.js Documentation](https://nextjs.org/docs)
-   [Vercel Documentation](https://vercel.com/docs)
