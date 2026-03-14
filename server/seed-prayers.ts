import { db } from "./db";
import { verses } from "@shared/schema";
import { eq } from "drizzle-orm";
import { prayersData } from "./prayers-data";

export async function seedPrayers() {
  console.log("Seeding prayers into verses...");
  
  for (const prayer of prayersData) {
    await db.update(verses)
      .set({
        prayerTitle: prayer.title,
        prayerText: prayer.text,
        prayerSection: prayer.section,
      })
      .where(eq(verses.verseNumber, prayer.number));
  }
  
  console.log(`Updated ${prayersData.length} verses with prayers.`);
}
