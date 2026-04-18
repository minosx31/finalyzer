-- Transaction redesign: replace payee with description, add type/toAccountId/transferFee
-- Categories: add type field for UI filtering

ALTER TABLE "categories" ADD COLUMN "type" text NOT NULL DEFAULT 'both';--> statement-breakpoint

ALTER TABLE "transactions" ADD COLUMN "type" text NOT NULL DEFAULT 'expense';--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "to_account_id" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "transfer_fee" integer;--> statement-breakpoint

-- Migrate existing data: payee → description, infer type from amount sign
UPDATE "transactions" SET "description" = "payee" WHERE "payee" IS NOT NULL AND "payee" != '';
UPDATE "transactions" SET "type" = 'income' WHERE "amount" > 0;
UPDATE "transactions" SET "type" = 'expense' WHERE "amount" < 0;
-- Make amounts always positive (expenses were stored negative)
UPDATE "transactions" SET "amount" = ABS("amount");--> statement-breakpoint

ALTER TABLE "transactions" DROP COLUMN "payee";--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_to_account_id_accounts_id_fk" FOREIGN KEY ("to_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
