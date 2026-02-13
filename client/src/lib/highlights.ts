export interface BibleHighlight {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  savedAt: string;
}

const HIGHLIGHTS_KEY = "faith-empire-highlights";

export function getHighlights(): BibleHighlight[] {
  try {
    const stored = localStorage.getItem(HIGHLIGHTS_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function isHighlighted(book: string, chapter: number, verse: number): boolean {
  const highlights = getHighlights();
  return highlights.some(
    (h) => h.book === book && h.chapter === chapter && h.verse === verse
  );
}

export function addHighlight(highlight: Omit<BibleHighlight, "id" | "savedAt">): void {
  const highlights = getHighlights();
  const id = `${highlight.book}-${highlight.chapter}-${highlight.verse}`;
  if (!highlights.some((h) => h.id === id)) {
    highlights.unshift({
      ...highlight,
      id,
      savedAt: new Date().toISOString(),
    });
    localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(highlights));
  }
}

export function removeHighlight(book: string, chapter: number, verse: number): void {
  const id = `${book}-${chapter}-${verse}`;
  const highlights = getHighlights().filter((h) => h.id !== id);
  localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(highlights));
}

export function toggleHighlight(
  book: string,
  chapter: number,
  verse: number,
  text: string
): boolean {
  if (isHighlighted(book, chapter, verse)) {
    removeHighlight(book, chapter, verse);
    return false;
  } else {
    addHighlight({ book, chapter, verse, text });
    return true;
  }
}
