import {
  type Verse, type InsertVerse,
  type Subscriber, type InsertSubscriber,
  verses, subscribers,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, gte, lte, and, count, sql } from "drizzle-orm";

export interface IStorage {
  getVerseByNumber(verseNumber: number): Promise<Verse | undefined>;
  getVersesByRange(start: number, end: number): Promise<Verse[]>;
  getAllVerses(): Promise<Verse[]>;
  getVersesByCategory(category: string): Promise<Verse[]>;
  insertVerse(verse: InsertVerse): Promise<Verse>;
  getVerseCount(): Promise<number>;
  createSubscriber(sub: InsertSubscriber): Promise<Subscriber>;
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;
  deleteSubscriberByEmail(email: string): Promise<boolean>;
  getAllSubscribers(): Promise<Subscriber[]>;
}

export class DatabaseStorage implements IStorage {
  async getVerseByNumber(verseNumber: number): Promise<Verse | undefined> {
    const [verse] = await db.select().from(verses).where(eq(verses.verseNumber, verseNumber));
    return verse;
  }

  async getVersesByRange(start: number, end: number): Promise<Verse[]> {
    return db.select().from(verses).where(
      and(gte(verses.verseNumber, start), lte(verses.verseNumber, end))
    );
  }

  async getAllVerses(): Promise<Verse[]> {
    return db.select().from(verses).orderBy(verses.verseNumber);
  }

  async getVersesByCategory(category: string): Promise<Verse[]> {
    return db.select().from(verses).where(eq(verses.category, category));
  }

  async insertVerse(verse: InsertVerse): Promise<Verse> {
    const [created] = await db.insert(verses).values(verse).returning();
    return created;
  }

  async getVerseCount(): Promise<number> {
    const [result] = await db.select({ value: count() }).from(verses);
    return result.value;
  }

  async createSubscriber(sub: InsertSubscriber): Promise<Subscriber> {
    const [created] = await db.insert(subscribers).values(sub).returning();
    return created;
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    const [sub] = await db.select().from(subscribers).where(eq(subscribers.email, email));
    return sub;
  }

  async deleteSubscriberByEmail(email: string): Promise<boolean> {
    const result = await db.delete(subscribers).where(eq(subscribers.email, email)).returning();
    return result.length > 0;
  }

  async getAllSubscribers(): Promise<Subscriber[]> {
    return db.select().from(subscribers).where(eq(subscribers.active, true)).orderBy(desc(subscribers.subscribedAt));
  }
}

export const storage = new DatabaseStorage();
