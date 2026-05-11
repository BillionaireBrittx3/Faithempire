import { useEffect } from "react";

const BASE = "Decoded Faith Empire";

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} · ${BASE}` : `${BASE} - Daily Bible Verse & Decoded Message`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
