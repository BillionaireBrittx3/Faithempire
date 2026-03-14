const PROGRESS_KEY = "faith-empire-reading-progress";

interface ReadingProgress {
  [bookSlug: string]: number[];
}

function getProgress(): ReadingProgress {
  try {
    const stored = localStorage.getItem(PROGRESS_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

function saveProgress(progress: ReadingProgress): void {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function markChapterRead(bookSlug: string, chapter: number): void {
  const progress = getProgress();
  if (!progress[bookSlug]) {
    progress[bookSlug] = [];
  }
  if (!progress[bookSlug].includes(chapter)) {
    progress[bookSlug].push(chapter);
    saveProgress(progress);
  }
}

export function isChapterRead(bookSlug: string, chapter: number): boolean {
  const progress = getProgress();
  return progress[bookSlug]?.includes(chapter) || false;
}

export function getReadChapters(bookSlug: string): number[] {
  const progress = getProgress();
  return progress[bookSlug] || [];
}

export function getBookProgress(bookSlug: string, totalChapters: number): number {
  const read = getReadChapters(bookSlug);
  if (totalChapters === 0) return 0;
  return Math.round((read.length / totalChapters) * 100);
}
