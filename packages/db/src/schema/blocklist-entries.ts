import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { organization } from "./auth";

export const blocklistTypeEnum = pgEnum("blocklist_type", [
  "wallet",
  "email",
  "country",
]);

export const blocklistEntries = pgTable(
  "blocklist_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    type: blocklistTypeEnum("type").notNull(),
    value: text("value").notNull(),
    reason: text("reason"),
    createdBy: text("created_by"),
    livemode: boolean("livemode").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("blocklist_entries_unique").on(
      table.organizationId,
      table.type,
      table.value,
      table.livemode,
    ),
    index("blocklist_entries_org_idx").on(table.organizationId),
  ],
);

export type BlocklistEntry = typeof blocklistEntries.$inferSelect;
export type NewBlocklistEntry = typeof blocklistEntries.$inferInsert;
