const FONT_SIZE_KEY = "faith-empire-font-size";

export type FontSize = "small" | "medium" | "large";

const FONT_SIZES: Record<FontSize, { verse: string; body: string; label: string }> = {
  small: { verse: "text-xs", body: "text-xs", label: "Small" },
  medium: { verse: "text-sm", body: "text-sm", label: "Medium" },
  large: { verse: "text-base", body: "text-base", label: "Large" },
};

export function getFontSize(): FontSize {
  try {
    const stored = localStorage.getItem(FONT_SIZE_KEY);
    if (stored && (stored === "small" || stored === "medium" || stored === "large")) {
      return stored;
    }
  } catch {}
  return "medium";
}

export function setFontSize(size: FontSize): void {
  localStorage.setItem(FONT_SIZE_KEY, size);
}

export function getFontClasses(size: FontSize) {
  return FONT_SIZES[size];
}

export const FONT_SIZE_OPTIONS: FontSize[] = ["small", "medium", "large"];
