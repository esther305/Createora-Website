import { integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const projectsTable = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkUserId: text("clerk_user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull().default("image"),
  width: integer("width").notNull().default(1080),
  height: integer("height").notNull().default(1080),
  duration: integer("duration"),
  thumbnail: text("thumbnail"),
  document: jsonb("document").notNull().default({ version: 1, elements: [] }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Project = typeof projectsTable.$inferSelect;
