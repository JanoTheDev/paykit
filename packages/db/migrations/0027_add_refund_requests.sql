CREATE TYPE "refund_request_status" AS ENUM ('pending', 'approved', 'declined', 'expired');--> statement-breakpoint
CREATE TABLE "refund_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "payment_id" uuid NOT NULL REFERENCES "payments"("id") ON DELETE CASCADE,
  "customer_id" uuid NOT NULL REFERENCES "customers"("id") ON DELETE CASCADE,
  "amount" integer NOT NULL,
  "reason" text,
  "status" "refund_request_status" NOT NULL DEFAULT 'pending',
  "merchant_reason" text,
  "decided_by" text,
  "decided_at" timestamp with time zone,
  "refund_id" uuid REFERENCES "refunds"("id") ON DELETE SET NULL,
  "livemode" boolean NOT NULL DEFAULT false,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);--> statement-breakpoint
CREATE INDEX "refund_requests_org_idx" ON "refund_requests" ("organization_id");--> statement-breakpoint
CREATE INDEX "refund_requests_payment_idx" ON "refund_requests" ("payment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "refund_requests_open_unique" ON "refund_requests" ("payment_id", "customer_id") WHERE status = 'pending';
