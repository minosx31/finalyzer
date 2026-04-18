ALTER TABLE "accounts" RENAME COLUMN "balance" TO "initial_balance";--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "initial_balance" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "cpf_accounts" ALTER COLUMN "oa_balance" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "cpf_accounts" ALTER COLUMN "sa_balance" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "cpf_accounts" ALTER COLUMN "ma_balance" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "cpf_accounts" ALTER COLUMN "ra_balance" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "emergency_fund" ALTER COLUMN "current_amount" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "goals" ALTER COLUMN "target_amount" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "goals" ALTER COLUMN "current_amount" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "investments" ALTER COLUMN "shares" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "net_worth_snapshots" ALTER COLUMN "total_assets" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "net_worth_snapshots" ALTER COLUMN "total_liabilities" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "net_worth_snapshots" ALTER COLUMN "net_worth" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "currency" text DEFAULT 'SGD' NOT NULL;--> statement-breakpoint
ALTER TABLE "investments" ADD COLUMN "account_id" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "recurring_expense_id" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "investments" ADD CONSTRAINT "investments_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_recurring_expense_id_recurring_expenses_id_fk" FOREIGN KEY ("recurring_expense_id") REFERENCES "public"."recurring_expenses"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
