import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { organization } from "./auth";

/**
 * Per-merchant per-network payout wallet configuration.
 *
 * Three-state model:
 *   - row missing              → network not configured (implicitly disabled)
 *   - enabled=true, addr NULL  → use merchant's default wallet from users.walletAddress
 *   - enabled=true, addr 0x..  → use this override address for the network
 *   - enabled=false            → network disabled, even if the merchant had an override
 *
 * wallet_address is nullable ON PURPOSE — see spec §Data Model.
 */
export const merchantPayoutWallets = pgTable(
  "merchant_payout_wallets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    networkKey: text("network_key").notNull(),
    walletAddress: text("wallet_address"), // nullable: NULL means "use default"
    // Extended public key for UTXO chains (Bitcoin / Litecoin). NULL on EVM
    // rows. When set, the watcher derives per-session receive addresses
    // from this key; Paylix never sees the matching private key.
    xpub: text("xpub"),
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [unique("merchant_payout_wallets_unique").on(t.organizationId, t.networkKey)],
);

export type MerchantPayoutWallet = typeof merchantPayoutWallets.$inferSelect;
export type NewMerchantPayoutWallet =
  typeof merchantPayoutWallets.$inferInsert;
