import { pgTable, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const projectsTable = pgTable("projects", {
  id: text("id").primaryKey(),
  clerkUserId: text("clerk_user_id").notNull(),

  name: text("name").notNull(),

  type: text("type").notNull(),

  width: integer("width"),
  height: integer("height"),
  duration: integer("duration"),

  thumbnail: text("thumbnail"),
  document: jsonb("document"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const insertProjectSchema = createInsertSchema(projectsTable);

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projectsTable.$inferSelect;