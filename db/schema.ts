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
    recurringExpenses: many(recurringExpenses),
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
});

export const recurringExpenses = pgTable("recurring_expenses", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    amount: integer("amount").notNull(), // milliunits
    frequency: text("frequency").notNull(), // weekly, monthly, yearly
    startDate: timestamp("start_date", { mode: "date" }).notNull(),
    categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
});

export const recurringExpensesRelations = relations(recurringExpenses, ({ one }) => ({
    category: one(categories, {
        fields: [recurringExpenses.categoryId],
        references: [categories.id],
    }),
}));

export const insertRecurringExpenseSchema = createInsertSchema(recurringExpenses, {
    amount: z.number().min(1, "Amount is required"),
    startDate: z.coerce.date(),
});

// ─── User Profile ────────────────────────────────────────────────────────────
export const userProfile = pgTable("user_profile", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().unique(),
    monthlyIncome: integer("monthly_income").notNull().default(0),   // milliunits
    annualIncome: integer("annual_income").notNull().default(0),     // milliunits
    age: integer("age"),
    citizenshipStatus: text("citizenship_status").default("citizen"), // "citizen" | "pr" | "foreigner"
    expectedSavingsRate: integer("expected_savings_rate").default(20), // percentage e.g. 20 = 20%
    lastHealthCheckAt: timestamp("last_health_check_at", { mode: "date" }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserProfileSchema = createInsertSchema(userProfile);

// ─── Budgets ─────────────────────────────────────────────────────────────────
export const budgets = pgTable("budgets", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
    amount: integer("amount").notNull(), // milliunits
    period: text("period").notNull().default("monthly"), // "monthly" | "annual"
});

export const budgetsRelations = relations(budgets, ({ one }) => ({
    category: one(categories, {
        fields: [budgets.categoryId],
        references: [categories.id],
    }),
}));

export const insertBudgetSchema = createInsertSchema(budgets);

// ─── Emergency Fund ───────────────────────────────────────────────────────────
export const emergencyFund = pgTable("emergency_fund", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().unique(),
    targetMonths: integer("target_months").notNull().default(6),
    currentAmount: integer("current_amount").notNull().default(0), // milliunits
});

export const insertEmergencyFundSchema = createInsertSchema(emergencyFund);

// ─── CPF ─────────────────────────────────────────────────────────────────────
export const cpfAccounts = pgTable("cpf_accounts", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().unique(),
    oaBalance: integer("oa_balance").notNull().default(0),  // milliunits
    saBalance: integer("sa_balance").notNull().default(0),  // milliunits
    maBalance: integer("ma_balance").notNull().default(0),  // milliunits
    raBalance: integer("ra_balance").notNull().default(0),  // milliunits (age 55+)
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCpfAccountSchema = createInsertSchema(cpfAccounts);

export const cpfContributions = pgTable("cpf_contributions", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    month: timestamp("month", { mode: "date" }).notNull(),
    grossSalary: integer("gross_salary").notNull(),            // milliunits (capped at OW ceiling)
    employeeContribution: integer("employee_contribution").notNull(), // milliunits
    employerContribution: integer("employer_contribution").notNull(), // milliunits
    oaAmount: integer("oa_amount").notNull(),                  // milliunits
    saAmount: integer("sa_amount").notNull(),                  // milliunits
    maAmount: integer("ma_amount").notNull(),                  // milliunits
    raAmount: integer("ra_amount").notNull().default(0),       // milliunits (age 55+)
});

export const insertCpfContributionSchema = createInsertSchema(cpfContributions, {
    month: z.coerce.date(),
});

// ─── Net Worth Snapshots ──────────────────────────────────────────────────────
export const netWorthSnapshots = pgTable("net_worth_snapshots", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    totalAssets: integer("total_assets").notNull(),       // milliunits
    totalLiabilities: integer("total_liabilities").notNull(), // milliunits
    netWorth: integer("net_worth").notNull(),             // milliunits (assets - liabilities)
    snapshotDate: timestamp("snapshot_date", { mode: "date" }).notNull(),
});

export const insertNetWorthSnapshotSchema = createInsertSchema(netWorthSnapshots, {
    snapshotDate: z.coerce.date(),
});

// ─── Investments ──────────────────────────────────────────────────────────────
export const investments = pgTable("investments", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    ticker: text("ticker").notNull(),       // e.g. "ES3.SI", "TSLA"
    name: text("name").notNull(),
    type: text("type").notNull(),           // "stock" | "etf" | "reit" | "bond" | "crypto" | "other"
    exchange: text("exchange"),             // "SGX" | "NYSE" | "NASDAQ" etc.
    shares: integer("shares").notNull(),    // milliunits for fractional share support
    avgCostPrice: integer("avg_cost_price").notNull(), // milliunits per share
    currentPrice: integer("current_price").notNull(),  // milliunits per share (manually updated)
    currency: text("currency").notNull().default("SGD"),
});

export const insertInvestmentSchema = createInsertSchema(investments);

export const dividends = pgTable("dividends", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    investmentId: text("investment_id").references(() => investments.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(), // milliunits
    date: timestamp("date", { mode: "date" }).notNull(),
});

export const dividendsRelations = relations(dividends, ({ one }) => ({
    investment: one(investments, {
        fields: [dividends.investmentId],
        references: [investments.id],
    }),
}));

export const insertDividendSchema = createInsertSchema(dividends, {
    date: z.coerce.date(),
});