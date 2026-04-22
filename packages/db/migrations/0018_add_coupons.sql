CREATE TYPE "coupon_type" AS ENUM ('percent', 'fixed');--> statement-breakpoint
CREATE TYPE "coupon_duration" AS ENUM ('once', 'forever', 'repeating');--> statement-breakpoint
CREATE TABLE "coupons" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "code" text NOT NULL,
  "type" "coupon_type" NOT NULL,
  "percent_off" integer,
  "amount_off_cents" integer,
  "duration" "coupon_duration" NOT NULL,
  "duration_in_cycles" integer,
  "max_redemptions" integer,
  "redemption_count" integer NOT NULL DEFAULT 0,
  "redeem_by" timestamp with time zone,
  "first_time_customer_only" boolean NOT NULL DEFAULT false,
  "is_active" boolean NOT NULL DEFAULT true,
  "livemode" boolean NOT NULL DEFAULT false,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);--> statement-breakpoint
CREATE UNIQUE INDEX "coupons_org_code_idx" ON "coupons" ("organization_id", "code");--> statement-breakpoint
CREATE TABLE "coupon_redemptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "coupon_id" uuid NOT NULL REFERENCES "coupons"("id") ON DELETE CASCADE,
  "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "checkout_session_id" uuid REFERENCES "checkout_sessions"("id") ON DELETE SET NULL,
  "subscription_id" uuid REFERENCES "subscriptions"("id") ON DELETE SET NULL,
  "payment_id" uuid REFERENCES "payments"("id") ON DELETE SET NULL,
  "discount_cents" integer NOT NULL,
  "cycle_number" integer,
  "livemode" boolean NOT NULL DEFAULT false,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);--> statement-breakpoint
CREATE INDEX "coupon_redemptions_coupon_idx" ON "coupon_redemptions" ("coupon_id");--> statement-breakpoint
CREATE INDEX "coupon_redemptions_subscription_idx" ON "coupon_redemptions" ("subscription_id");--> statement-breakpoint
ALTER TABLE "checkout_sessions" ADD COLUMN "applied_coupon_id" uuid;--> statement-breakpoint
ALTER TABLE "checkout_sessions" ADD COLUMN "discount_cents" integer;--> statement-breakpoint
ALTER TABLE "checkout_sessions" ADD COLUMN "subtotal_amount" bigint;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "applied_coupon_id" uuid;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "coupon_cycles_remaining" integer;
