ALTER TABLE "recurring_expenses" ADD COLUMN "account_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "recurring_expenses" ADD COLUMN "last_generated_at" timestamp;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recurring_expenses" ADD CONSTRAINT "recurring_expenses_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
