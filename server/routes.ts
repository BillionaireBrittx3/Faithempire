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
      const startOfYear = new Date(new Date().getFullYear(), 0, 1);
      const now = new Date();
      const dayOfYear = Math.floor(
        (now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

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

  return httpServer;
}
