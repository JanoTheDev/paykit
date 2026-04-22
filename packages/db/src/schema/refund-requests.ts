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
import { sql } from "drizzle-orm";
import { organization } from "./auth";
import { payments } from "./payments";
import { customers } from "./customers";
import { refunds } from "./refunds";

export const refundRequestStatusEnum = pgEnum("refund_request_status", [
  "pending",
  "approved",
  "declined",
  "expired",
]);

/**
 * Customer-initiated refund intents. Stored independently from the
 * refunds table; once a merchant approves, the existing refund flow
 * creates a refund row and the request is linked via refund_id.
 */
export const refundRequests = pgTable(
  "refund_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    paymentId: uuid("payment_id")
      .notNull()
      .references(() => payments.id, { onDelete: "cascade" }),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    reason: text("reason"),
    status: refundRequestStatusEnum("status").notNull().default("pending"),
    merchantReason: text("merchant_reason"),
    decidedBy: text("decided_by"),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    refundId: uuid("refund_id").references(() => refunds.id, {
      onDelete: "set null",
    }),
    livemode: boolean("livemode").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("refund_requests_org_idx").on(table.organizationId),
    index("refund_requests_payment_idx").on(table.paymentId),
    // At most one open (pending) request per payment per customer —
    // filtered unique. Additional requests can exist after decline +
    // cool-down.
    uniqueIndex("refund_requests_open_unique")
      .on(table.paymentId, table.customerId)
      .where(sql`status = 'pending'`),
  ],
);

export type RefundRequest = typeof refundRequests.$inferSelect;
export type NewRefundRequest = typeof refundRequests.$inferInsert;
