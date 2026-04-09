// Re-export the better-auth user table as "users" for backwards compatibility
// All other schemas import { users } from "./users" — this alias keeps them working
import { user } from "./auth";

export const users = user;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
