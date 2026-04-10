import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const systemStatus = pgTable("system_status", {
  key: text("key").primaryKey(),
  value: text("value"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SystemStatus = typeof systemStatus.$inferSelect;
