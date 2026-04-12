ALTER TABLE "products" ADD COLUMN "livemode" boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "livemode" boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "livemode" boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE "checkout_sessions" ADD COLUMN "livemode" boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "livemode" boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "livemode" boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE "invoice_line_items" ADD COLUMN "livemode" boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE "product_prices" ADD COLUMN "livemode" boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE "webhooks" ADD COLUMN "livemode" boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE "webhook_deliveries" ADD COLUMN "livemode" boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE "idempotency_keys" ADD COLUMN "livemode" boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "livemode" boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE "unmatched_events" ADD COLUMN "livemode" boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE "api_keys" ADD COLUMN "livemode" boolean NOT NULL DEFAULT false;--> statement-breakpoint
UPDATE "api_keys" SET "livemode" = true WHERE "prefix" LIKE 'pk_live_%' OR "prefix" LIKE 'sk_live_%';
