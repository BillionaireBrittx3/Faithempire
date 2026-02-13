import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { storage } from "./storage";
import { insertSubscriberSchema } from "@shared/schema";
import { z } from "zod";
import genesisDecoded from "./data/genesis-decoded.json";

const aasaContent = {
  applinks: {
    apps: [],
    details: [
      {
        appID: "TEAM_ID.com.decodedfaithempire.faithempire",
        paths: ["/", "/bible", "/bible/*", "/decoded", "/decoded/*", "/podcast", "/archive", "/favorites", "/about", "/privacy", "/terms"]
      }
    ]
  },
  webcredentials: {
    apps: ["TEAM_ID.com.decodedfaithempire.faithempire"]
  }
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/.well-known/apple-app-site-association", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.json(aasaContent);
  });

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

  app.get("/api/subscribers/export", async (req, res) => {
    try {
      const adminKey = req.query.key;
      if (!adminKey || adminKey !== process.env.ADMIN_EXPORT_KEY) {
        return res.status(401).json({ message: "Unauthorized" });
      }
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

  app.get("/api/bible/:book/:chapter", async (req, res) => {
    try {
      const { book, chapter } = req.params;
      const chapterNum = parseInt(chapter);
      if (isNaN(chapterNum) || chapterNum < 1) {
        return res.status(400).json({ message: "Invalid chapter number" });
      }

      const query = encodeURIComponent(`${book} ${chapterNum}`);
      const response = await fetch(
        `https://bible-api.com/${query}?translation=kjv`
      );

      if (!response.ok) {
        return res.status(502).json({ message: "Failed to fetch Bible text" });
      }

      const data = await response.json();
      if (data.error) {
        return res.status(404).json({ message: data.error });
      }

      const verses = (data.verses || []).map((v: any) => ({
        verse: v.verse,
        text: v.text?.trim() || "",
      }));

      res.json({
        reference: data.reference || `${book} ${chapterNum}`,
        verses,
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to load Bible chapter" });
    }
  });

  app.get("/api/decoded/genesis", async (_req, res) => {
    try {
      const summary = {
        title: genesisDecoded.title,
        author: genesisDecoded.author,
        description: genesisDecoded.description,
        copyright: genesisDecoded.copyright,
        totalChapters: genesisDecoded.totalChapters,
        chapters: (genesisDecoded.chapters as any[]).map((ch) => ({
          number: ch.number,
          title: ch.title,
          verseCount: ch.verses.length,
        })),
      };
      res.json(summary);
    } catch (err) {
      res.status(500).json({ message: "Failed to load decoded book" });
    }
  });

  app.get("/api/decoded/genesis/:chapter", async (req, res) => {
    try {
      const chapterNum = parseInt(req.params.chapter);
      if (isNaN(chapterNum) || chapterNum < 1 || chapterNum > 50) {
        return res.status(400).json({ message: "Invalid chapter number (1-50)" });
      }
      const chapter = (genesisDecoded.chapters as any[]).find(
        (ch) => ch.number === chapterNum
      );
      if (!chapter) {
        return res.status(404).json({ message: "Chapter not found" });
      }
      res.json(chapter);
    } catch (err) {
      res.status(500).json({ message: "Failed to load chapter" });
    }
  });

  app.get("/api/podcast/episodes", async (_req, res) => {
    try {
      const response = await fetch("https://anchor.fm/s/10ee7543c/podcast/rss");
      if (!response.ok) {
        return res.status(502).json({ message: "Failed to fetch podcast feed" });
      }
      const xml = await response.text();

      const episodes: Array<{
        title: string;
        description: string;
        audioUrl: string;
        pubDate: string;
        duration: string;
        episodeNumber: number | null;
        link: string;
      }> = [];

      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match;
      while ((match = itemRegex.exec(xml)) !== null) {
        const item = match[1];
        const getTag = (tag: string) => {
          const m = item.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`));
          return m ? m[1].trim() : "";
        };
        const getAttr = (tag: string, attr: string) => {
          const m = item.match(new RegExp(`<${tag}[^>]*${attr}="([^"]*)"[^>]*/?>`, "i"));
          return m ? m[1] : "";
        };

        const title = getTag("title");
        const descRaw = getTag("description");
        const description = descRaw.replace(/<[^>]+>/g, "").substring(0, 300);
        const audioUrl = getAttr("enclosure", "url");
        const pubDate = getTag("pubDate");
        const duration = getTag("itunes:duration");
        const epNum = getTag("itunes:episode");
        const link = getTag("link");

        if (audioUrl) {
          episodes.push({
            title,
            description: description + (descRaw.length > 300 ? "..." : ""),
            audioUrl,
            pubDate,
            duration,
            episodeNumber: epNum ? parseInt(epNum) : null,
            link,
          });
        }
      }

      res.json(episodes);
    } catch (err) {
      res.status(500).json({ message: "Failed to load podcast episodes" });
    }
  });

  return httpServer;
}
