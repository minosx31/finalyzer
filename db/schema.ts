import { z } from "zod";
import { relations } from "drizzle-orm";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const accounts = pgTable("accounts", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    userId: text("user_id").notNull(),
    plaidId: text("plaid_id"),
    // New fields
    type: text("type"), // 'bank', 'credit', 'investment', etc.
    balance: integer("balance").default(0), // Cached balance (optional, or just computed) - actually let's stick to computing it from transactions for now to avoid sync issues, OR if the user wants manual accounts, we might need an initial balance. 
    // Wait, the plan said "Fetch current balances... Calculate balance as SUM(amount)". 
    // But for credit cards we need a LIMIT.
    creditLimit: integer("credit_limit"), // in milliunits
    dueDate: integer("due_date"), // Day of month 1-31
    interestRate: integer("interest_rate"), // in basis points (1/100th of a percent)
});

export const accountsRelation = relations(accounts, ({ many }) => ({
    transactions: many(transactions),
}));

export const insertAccountSchema = createInsertSchema(accounts);

export const categories = pgTable("categories", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    userId: text("user_id").notNull(),
    plaidId: text("plaid_id"),
});

export const categoriesRelation = relations(categories, ({ many }) => ({
    transactions: many(transactions),
}));

export const insertCategorySchema = createInsertSchema(categories);

export const goals = pgTable("goals", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    targetAmount: integer("target_amount").notNull(), // milliunits
    currentAmount: integer("current_amount").default(0).notNull(), // milliunits
    deadline: timestamp("deadline", { mode: "date" }),
});

export const insertGoalSchema = createInsertSchema(goals, {
    deadline: z.coerce.date(),
});



export const transactions = pgTable("transactions", {
    id: text("id").primaryKey(),
    amount: integer("amount").notNull(),
    payee: text("payee").notNull(),
    notes: text("notes"),
    date: timestamp("date", { mode: "date" }).notNull(),
    accountId: text("account_id").references(() => accounts.id, {
        onDelete: "cascade",
    }).notNull(),
    categoryId: text("category_id").references(() => categories.id, {
        onDelete: "set null",
    }),
});

export const transactionsRelation = relations(transactions, ({ one }) => ({
    accounts: one(accounts, {
        fields: [transactions.accountId],
        references: [accounts.id],
    }),
    categories: one(categories, {
        fields: [transactions.categoryId],
        references: [categories.id],
    }),
}));

export const insertTransactionSchema = createInsertSchema(transactions, {
    date: z.coerce.date(),
})