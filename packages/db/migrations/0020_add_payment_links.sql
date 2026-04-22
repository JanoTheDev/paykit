CREATE TABLE "payment_links" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "customer_id" text,
  "network_key" text,
  "token_symbol" text,
  "is_active" boolean NOT NULL DEFAULT true,
  "max_redemptions" integer,
  "redemption_count" integer NOT NULL DEFAULT 0,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "livemode" boolean NOT NULL DEFAULT false,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);--> statement-breakpoint
CREATE INDEX "payment_links_org_idx" ON "payment_links" ("organization_id");--> statement-breakpoint
CREATE INDEX "payment_links_product_idx" ON "payment_links" ("product_id");
