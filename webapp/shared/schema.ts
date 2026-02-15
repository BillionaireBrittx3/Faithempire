import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, date, timestamp, boolean, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const verses = pgTable("verses", {
  id: serial("id").primaryKey(),
  verseNumber: integer("verse_number").notNull().unique(),
  reference: text("reference").notNull(),
  verseText: text("verse_text").notNull(),
  decodedMessage: text("decoded_message").notNull(),
  category: text("category").notNull(),
  book: text("book").notNull(),
});

export const insertVerseSchema = createInsertSchema(verses).omit({ id: true });
export type InsertVerse = z.infer<typeof insertVerseSchema>;
export type Verse = typeof verses.$inferSelect;

export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  active: boolean("active").default(true),
  source: text("source").default("app"),
});

export const insertSubscriberSchema = createInsertSchema(subscribers).omit({ id: true, subscribedAt: true });
export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;
export type Subscriber = typeof subscribers.$inferSelect;
