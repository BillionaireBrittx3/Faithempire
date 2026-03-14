const CACHE_PREFIX = "faith-empire-bible-";
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000;

interface BibleVerse {
  verse: number;
  text: string;
}

interface ChapterData {
  reference: string;
  verses: BibleVerse[];
}

interface CachedChapter {
  data: ChapterData;
  timestamp: number;
}

export function getCachedChapter(book: string, chapter: number): ChapterData | null {
  try {
    const key = `${CACHE_PREFIX}${book}-${chapter}`;
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    const cached: CachedChapter = JSON.parse(stored);
    if (Date.now() - cached.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(key);
      return null;
    }
    return cached.data;
  } catch {
    return null;
  }
}

export function cacheChapter(book: string, chapter: number, data: ChapterData): void {
  try {
    const key = `${CACHE_PREFIX}${book}-${chapter}`;
    const cached: CachedChapter = { data, timestamp: Date.now() };
    localStorage.setItem(key, JSON.stringify(cached));
  } catch {}
}
