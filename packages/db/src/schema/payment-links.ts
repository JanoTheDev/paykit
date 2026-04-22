import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { organization } from "./auth";
import { products } from "./products";

export const paymentLinks = pgTable(
  "payment_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    customerId: text("customer_id"),
    networkKey: text("network_key"),
    tokenSymbol: text("token_symbol"),
    isActive: boolean("is_active").notNull().default(true),
    maxRedemptions: integer("max_redemptions"),
    redemptionCount: integer("redemption_count").notNull().default(0),
    metadata: jsonb("metadata").$type<Record<string, string>>().default({}),
    livemode: boolean("livemode").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("payment_links_org_idx").on(table.organizationId),
    index("payment_links_product_idx").on(table.productId),
  ],
);

export type PaymentLink = typeof paymentLinks.$inferSelect;
export type NewPaymentLink = typeof paymentLinks.$inferInsert;
