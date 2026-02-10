import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubscriberSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/verses/today", async (_req, res) => {
    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      const parts = formatter.formatToParts(new Date());
      const year = parseInt(parts.find(p => p.type === "year")!.value);
      const month = parseInt(parts.find(p => p.type === "month")!.value);
      const day = parseInt(parts.find(p => p.type === "day")!.value);

      const daysInMonth = [31, (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      let dayOfYear = day;
      for (let i = 0; i < month - 1; i++) {
        dayOfYear += daysInMonth[i];
      }

      const totalVerses = await storage.getVerseCount();
      if (totalVerses === 0) {
        return res.status(404).json({ message: "No verses available yet" });
      }

      const verseNumber = ((dayOfYear - 1) % totalVerses) + 1;
      const verse = await storage.getVerseByNumber(verseNumber);

      if (!verse) {
        const fallback = await storage.getVerseByNumber(1);
        return fallback
          ? res.json(fallback)
          : res.status(404).json({ message: "Verse not found" });
      }

      res.json(verse);
    } catch (err) {
      res.status(500).json({ message: "Failed to get today's verse" });
    }
  });

  app.get("/api/verses/archive", async (_req, res) => {
    try {
      const allVerses = await storage.getAllVerses();
      res.json(allVerses);
    } catch (err) {
      res.status(500).json({ message: "Failed to get verse archive" });
    }
  });

  app.get("/api/verses/:id", async (req, res) => {
    try {
      const verseNumber = parseInt(req.params.id);
      if (isNaN(verseNumber)) {
        return res.status(400).json({ message: "Invalid verse number" });
      }
      const verse = await storage.getVerseByNumber(verseNumber);
      if (!verse) {
        return res.status(404).json({ message: "Verse not found" });
      }
      res.json(verse);
    } catch (err) {
      res.status(500).json({ message: "Failed to get verse" });
    }
  });

  app.post("/api/subscribe", async (req, res) => {
    try {
      const parsed = insertSubscriberSchema.safeParse({
        email: req.body.email,
        active: true,
        source: "app",
      });

      if (!parsed.success) {
        return res.status(400).json({ message: "Valid email is required", errors: parsed.error.flatten() });
      }

      const existing = await storage.getSubscriberByEmail(parsed.data.email!);
      if (existing) {
        return res.status(409).json({ message: "Already subscribed" });
      }

      await storage.createSubscriber(parsed.data);
      res.status(201).json({ message: "Subscribed successfully" });
    } catch (err) {
      res.status(500).json({ message: "Failed to subscribe" });
    }
  });

  app.post("/api/unsubscribe", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || typeof email !== "string" || !email.includes("@")) {
        return res.status(400).json({ message: "Valid email is required" });
      }

      const deleted = await storage.deleteSubscriberByEmail(email);
      if (!deleted) {
        return res.status(404).json({ message: "Email not found in our records" });
      }

      res.json({ message: "Successfully unsubscribed and data deleted" });
    } catch (err) {
      res.status(500).json({ message: "Failed to unsubscribe" });
    }
  });

  app.get("/api/subscribers/export", async (_req, res) => {
    try {
      const subscribers = await storage.getAllSubscribers();
      const header = "Email,Subscribed Date,Source\n";
      const rows = subscribers.map(s =>
        `"${s.email}","${s.subscribedAt ? new Date(s.subscribedAt).toISOString() : ""}","${s.source || "app"}"`
      ).join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=faith-empire-subscribers.csv");
      res.send(header + rows);
    } catch (err) {
      res.status(500).json({ message: "Failed to export subscribers" });
    }
  });

  return httpServer;
}
