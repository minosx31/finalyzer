CREATE TABLE IF NOT EXISTS "budgets" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"category_id" text,
	"amount" integer NOT NULL,
	"period" text DEFAULT 'monthly' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cpf_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"oa_balance" integer DEFAULT 0 NOT NULL,
	"sa_balance" integer DEFAULT 0 NOT NULL,
	"ma_balance" integer DEFAULT 0 NOT NULL,
	"ra_balance" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "cpf_accounts_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cpf_contributions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"month" timestamp NOT NULL,
	"gross_salary" integer NOT NULL,
	"employee_contribution" integer NOT NULL,
	"employer_contribution" integer NOT NULL,
	"oa_amount" integer NOT NULL,
	"sa_amount" integer NOT NULL,
	"ma_amount" integer NOT NULL,
	"ra_amount" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dividends" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"investment_id" text,
	"amount" integer NOT NULL,
	"date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "emergency_fund" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"target_months" integer DEFAULT 6 NOT NULL,
	"current_amount" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "emergency_fund_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "investments" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"ticker" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"exchange" text,
	"shares" integer NOT NULL,
	"avg_cost_price" integer NOT NULL,
	"current_price" integer NOT NULL,
	"currency" text DEFAULT 'SGD' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "net_worth_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"total_assets" integer NOT NULL,
	"total_liabilities" integer NOT NULL,
	"net_worth" integer NOT NULL,
	"snapshot_date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"monthly_income" integer DEFAULT 0 NOT NULL,
	"annual_income" integer DEFAULT 0 NOT NULL,
	"age" integer,
	"citizenship_status" text DEFAULT 'citizen',
	"expected_savings_rate" integer DEFAULT 20,
	"last_health_check_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_profile_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "budgets" ADD CONSTRAINT "budgets_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dividends" ADD CONSTRAINT "dividends_investment_id_investments_id_fk" FOREIGN KEY ("investment_id") REFERENCES "public"."investments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
