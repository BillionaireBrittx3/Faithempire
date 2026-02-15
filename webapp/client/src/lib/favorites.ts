import type { Verse } from "@shared/schema";

const FAVORITES_KEY = "faith-empire-favorites";

export function getFavorites(): Verse[] {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function isFavorite(verseId: number): boolean {
  const favorites = getFavorites();
  return favorites.some((v) => v.id === verseId);
}

export function addFavorite(verse: Verse): void {
  const favorites = getFavorites();
  if (!favorites.some((v) => v.id === verse.id)) {
    favorites.unshift(verse);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
}

export function removeFavorite(verseId: number): void {
  const favorites = getFavorites().filter((v) => v.id !== verseId);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function toggleFavorite(verse: Verse): boolean {
  if (isFavorite(verse.id)) {
    removeFavorite(verse.id);
    return false;
  } else {
    addFavorite(verse);
    return true;
  }
}
