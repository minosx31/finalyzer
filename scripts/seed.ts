import { config } from "dotenv";
import { subDays } from "date-fns";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { accounts, categories, transactions } from "@/db/schema";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const SEED_USER_ID = "user_2hHMSvfLJ1FGnpHLGVvTmzcW14W";
const SEED_CATEGORIES = [
    { id: "Category_1", name: "Food", userId: SEED_USER_ID, plaidId: null },
    { id: "Category_2", name: "Rent", userId: SEED_USER_ID, plaidId: null },
    { id: "Category_3", name: "Utilities", userId: SEED_USER_ID, plaidId: null },
    { id: "Category_4", name: "Health", userId: SEED_USER_ID, plaidId: null },
    { id: "Category_5", name: "Transportation", userId: SEED_USER_ID, plaidId: null },
    { id: "Category_6", name: "Entertainment", userId: SEED_USER_ID, plaidId: null },
    { id: "Category_7", name: "Miscellaneous", userId: SEED_USER_ID, plaidId: null },
];

const SEED_ACCOUNTS = [
    { id: "account_1", name: "Checking", userId: "SEED_USER_ID", plaidId: null },
    { id: "account_2", name: "Savings", userId: "SEED_USER_ID", plaidId: null },
];

const defaultTo = new Date();
const defaultFrom = subDays(defaultTo, 90);

const SEED_TRANSACTIONS: typeof transactions.$inferSelect[] = [];

import { eachDayOfInterval, format } from "date-fns";
import { convertAmountToMiliUnits } from "@/lib/utils";

const generateRandomAmount = (category: typeof categories.$inferInsert) => {
    switch (category.name) {
        case "Rent":
            return Math.random() * 400 + 90;
        case "Utilities":
            return Math.random() * 200 + 50;
        case "Food":
            return Math.random() * 30 + 10;
        case "Transportation":
            return Math.random() * 1.5 + 2.50;
        case "Health":
            return Math.random() * 30 + 15;
        case "Entertainment":
            return Math.random() * 10 + 5;
        case "Miscellaneous":
            return Math.random() * 100 + 20;
        default:
            return Math.random() * 50 + 10;
    }
};

const generateTransactionsForDay = (day: Date) => {
    const numTransactions = Math.floor(Math.random() * 4) + 1;

    for (let i = 0; i < numTransactions; i++) {
        const category = SEED_CATEGORIES[Math.floor(Math.random() * SEED_CATEGORIES.length)];
        const isExpense = Math.random() > 0.6;
        const amount = generateRandomAmount(category);
        const formattedAmount = convertAmountToMiliUnits(isExpense ? -amount : amount);

        SEED_TRANSACTIONS.push({
            id: `transaction_${SEED_TRANSACTIONS.length + 1}`,
            accountId: SEED_ACCOUNTS[0].id,
            categoryId: category.id,
            date: day,
            amount: formattedAmount,
            payee: "Merchant",
            notes: `Random Transaction ${SEED_TRANSACTIONS.length + 1}`,
        });
    }
};

const generateTransactions = () => {
    const days = eachDayOfInterval({
        start: defaultFrom,
        end: defaultTo,
    });

    days.forEach(day => generateTransactionsForDay(day));
};

generateTransactions();

const main = async () => {
    try {
        // Reset database
        await db.delete(transactions).execute();
        await db.delete(accounts).execute();
        await db.delete(categories).execute();

        // Seed categories
        await db.insert(categories).values(SEED_CATEGORIES).execute();

        // Seed accounts
        await db.insert(accounts).values(SEED_ACCOUNTS).execute();

        // Seed transactions
        await db.insert(transactions).values(SEED_TRANSACTIONS).execute();
    } catch (error) {
        console.error("Error during seed: ", error);
        process.exit(1);
    }
};

main();