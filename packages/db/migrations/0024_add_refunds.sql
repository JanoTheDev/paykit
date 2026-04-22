CREATE TYPE "refund_status" AS ENUM ('pending', 'confirmed', 'failed');--> statement-breakpoint
CREATE TABLE "refunds" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "payment_id" uuid NOT NULL REFERENCES "payments"("id") ON DELETE CASCADE,
  "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "amount" integer NOT NULL,
  "reason" text,
  "tx_hash" text NOT NULL,
  "status" "refund_status" NOT NULL DEFAULT 'pending',
  "created_by" text,
  "livemode" boolean NOT NULL DEFAULT false,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);--> statement-breakpoint
CREATE UNIQUE INDEX "refunds_tx_hash_idx" ON "refunds" ("tx_hash");--> statement-breakpoint
CREATE INDEX "refunds_payment_idx" ON "refunds" ("payment_id");--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "refunded_cents" integer NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "refunded_at" timestamp with time zone;
