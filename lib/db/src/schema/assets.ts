import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const assetsTable = pgTable("assets", {
  id: text("id").primaryKey(),
  clerkUserId: text("clerk_user_id").notNull(),

  projectId: text("project_id"),

  name: text("name").notNull(),

  type: text("type").notNull(),

  mimeType: text("mime_type"),

  url: text("url").notNull(),

  thumbnailUrl: text("thumbnail_url"),

  width: integer("width"),
  height: integer("height"),
  duration: integer("duration"),
  size: integer("size"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const insertAssetSchema = createInsertSchema(assetsTable);

export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Asset = typeof assetsTable.$inferSelect;