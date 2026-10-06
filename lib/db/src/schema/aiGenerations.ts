import { pgTable, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const aiGenerationsTable = pgTable("ai_generations", {
  id: text("id").primaryKey(),

  clerkUserId: text("clerk_user_id").notNull(),

  projectId: text("project_id"),
  assetId: text("asset_id"),

  type: text("type").notNull(),

  provider: text("provider").notNull(),
  model: text("model").notNull(),

  prompt: text("prompt").notNull(),

  aspectRatio: text("aspect_ratio"),

  outputUrl: text("output_url"),

  width: integer("width"),
  height: integer("height"),
  duration: integer("duration"),

  status: text("status").notNull().default("completed"),

  metadata: jsonb("metadata"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const insertAIGenerationSchema =
  createInsertSchema(aiGenerationsTable);

export type InsertAIGeneration = z.infer<
  typeof insertAIGenerationSchema
>;

export type AIGeneration =
  typeof aiGenerationsTable.$inferSelect;