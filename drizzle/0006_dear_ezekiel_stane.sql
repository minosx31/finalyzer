ALTER TABLE "transactions" RENAME COLUMN "payee" TO "type";--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "type" SET DEFAULT 'expense';--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "type" text DEFAULT 'both' NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "to_account_id" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "transfer_fee" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_to_account_id_accounts_id_fk" FOREIGN KEY ("to_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
