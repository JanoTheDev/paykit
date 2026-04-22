CREATE TYPE "blocklist_type" AS ENUM ('wallet', 'email', 'country');--> statement-breakpoint
CREATE TABLE "blocklist_entries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "type" "blocklist_type" NOT NULL,
  "value" text NOT NULL,
  "reason" text,
  "created_by" text,
  "livemode" boolean NOT NULL DEFAULT false,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);--> statement-breakpoint
CREATE UNIQUE INDEX "blocklist_entries_unique" ON "blocklist_entries" ("organization_id", "type", "value", "livemode");--> statement-breakpoint
CREATE INDEX "blocklist_entries_org_idx" ON "blocklist_entries" ("organization_id");
