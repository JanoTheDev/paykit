import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { organization } from "./auth";
import { payments } from "./payments";

export const refundStatusEnum = pgEnum("refund_status", [
  "pending",
  "confirmed",
  "failed",
]);

/**
 * Refund ledger. Paylix is non-custodial — the actual USDC movement is
 * a plain merchant-to-buyer ERC20 transfer executed by the merchant's
 * own wallet. The refund row here records the transfer for bookkeeping,
 * webhooks, and dashboard display.
 *
 * Merchant bears the full refund amount (including the 0.5% platform
 * fee paid on the original charge) — Paylix never returns fees.
 */
export const refunds = pgTable(
  "refunds",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    paymentId: uuid("payment_id")
      .notNull()
      .references(() => payments.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    reason: text("reason"),
    txHash: text("tx_hash").notNull(),
    status: refundStatusEnum("status").notNull().default("pending"),
    createdBy: text("created_by"),
    livemode: boolean("livemode").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // txHash is unique per chain in practice; for our single-chain setup
    // it's globally unique. Unique index prevents a merchant from reusing
    // a transfer tx for multiple refund rows.
    uniqueIndex("refunds_tx_hash_idx").on(table.txHash),
    index("refunds_payment_idx").on(table.paymentId),
  ],
);

export type Refund = typeof refunds.$inferSelect;
export type NewRefund = typeof refunds.$inferInsert;
