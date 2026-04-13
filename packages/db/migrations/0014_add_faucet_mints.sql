CREATE TABLE "faucet_mints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_address" text NOT NULL,
	"amount" bigint NOT NULL,
	"tx_hash" text NOT NULL,
	"chain_id" integer NOT NULL,
	"source" text NOT NULL,
	"organization_id" text,
	"checkout_session_id" uuid,
	"livemode" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "faucet_mints_wallet_idx" ON "faucet_mints" ("wallet_address");--> statement-breakpoint
CREATE INDEX "faucet_mints_created_idx" ON "faucet_mints" ("created_at");--> statement-breakpoint
ALTER TABLE "faucet_mints" ADD CONSTRAINT "faucet_mints_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faucet_mints" ADD CONSTRAINT "faucet_mints_checkout_session_id_checkout_sessions_id_fk" FOREIGN KEY ("checkout_session_id") REFERENCES "public"."checkout_sessions"("id") ON DELETE set null ON UPDATE no action;
