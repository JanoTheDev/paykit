ALTER TABLE "subscriptions" ADD COLUMN "trial_started_email_sent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "trial_converted_email_sent_at" timestamp with time zone;
