ALTER TABLE "subscriptions" ADD COLUMN "charge_failure_count" integer NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "last_charge_error" text;
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "last_charge_attempt_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "past_due_since" timestamp with time zone;
