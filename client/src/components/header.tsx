import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import logoPath from "@assets/Copy_of_EPRODUCTS_EMPIRE_PODCAST_(98)_1770693543975.png";

interface SearchVerse {
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

interface SearchResult {
  reference: string;
  verses: SearchVerse[];
}

export function Header() {
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (showSearch && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showSearch]);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 3) {
      setResults(null);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/bible/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "No results found");
        setResults(null);
      } else {
        setResults(data);
        setError("");
      }
    } catch {
      setError("Search failed. Try again.");
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = useCallback((val: string) => {
    setQuery(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => doSearch(val), 600);
  }, [doSearch]);

  const handleClose = useCallback(() => {
    setShowSearch(false);
    setQuery("");
    setResults(null);
    setError("");
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md px-4 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center justify-between">
          <div className="w-10" />
          <div className="flex items-center">
            <img
              src={logoPath}
              alt="Decoded Faith Empire"
              className="h-28 w-auto object-contain"
              data-testid="img-logo"
            />
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowSearch(!showSearch)}
            className="text-muted-foreground hover:text-primary"
            data-testid="button-search-toggle"
          >
            {showSearch ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </Button>
        </div>

        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pb-3 pt-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    placeholder="Search verses... (e.g. John 3:16, Psalm 23)"
                    className="pl-9 pr-4 bg-card border-border text-sm"
                    data-testid="input-verse-search"
                  />
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground/60 text-center">
                  Search by reference: "Romans 8:28", "Proverbs 3:5-6", "Psalm 91"
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {showSearch && (results || error || loading) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-0 top-0 z-50 mt-[calc(7rem+env(safe-area-inset-top)+3.5rem)] px-4 pb-4 max-h-[60vh] overflow-y-auto mx-auto max-w-lg"
          >
            <Card className="p-4 shadow-lg border-primary/20" data-testid="card-search-results">
              {loading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Searching...</span>
                </div>
              )}

              {error && !loading && (
                <p className="text-sm text-muted-foreground" data-testid="text-search-error">{error}</p>
              )}

              {results && !loading && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold text-primary" data-testid="text-search-reference">
                      {results.reference}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {results.verses.map((v, idx) => (
                      <div key={idx} className="flex gap-2">
                        <span className="text-xs font-bold text-primary shrink-0 pt-0.5 w-6 text-right">
                          {v.verse}
                        </span>
                        <p className="text-sm text-foreground/90 leading-relaxed" style={{ fontFamily: "'Lora', serif" }}>
                          {v.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <div
              className="fixed inset-0 -z-10"
              onClick={handleClose}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
