import { pgTable, uuid, text, bigint, integer, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { organization } from "./auth";
import { checkoutSessions } from "./checkout-sessions";

export const faucetMints = pgTable(
  "faucet_mints",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    walletAddress: text("wallet_address").notNull(),
    amount: bigint("amount", { mode: "bigint" }).notNull(),
    txHash: text("tx_hash").notNull(),
    chainId: integer("chain_id").notNull(),
    source: text("source").notNull(),
    organizationId: text("organization_id").references(() => organization.id, { onDelete: "set null" }),
    checkoutSessionId: uuid("checkout_session_id").references(() => checkoutSessions.id, { onDelete: "set null" }),
    livemode: boolean("livemode").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("faucet_mints_wallet_idx").on(table.walletAddress),
    index("faucet_mints_created_idx").on(table.createdAt),
  ],
);

export type FaucetMint = typeof faucetMints.$inferSelect;
export type NewFaucetMint = typeof faucetMints.$inferInsert;
