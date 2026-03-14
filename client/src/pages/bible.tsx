import { useState, useCallback, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, BookOpen, Highlighter, Lock, Crown, Search, X, Type } from "lucide-react";
import { BIBLE_BOOKS, type BibleBook } from "@/lib/bible-data";
import { isHighlighted, toggleHighlight, getHighlights } from "@/lib/highlights";
import { getCachedChapter, cacheChapter } from "@/lib/bible-cache";
import { getFontSize, setFontSize, getFontClasses, FONT_SIZE_OPTIONS, type FontSize } from "@/lib/font-size";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/lib/subscription";
import { useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

type ViewMode = "books" | "chapters" | "reading";

interface BibleVerse {
  verse: number;
  text: string;
}

interface ChapterData {
  reference: string;
  verses: BibleVerse[];
}

function ChapterSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex gap-2">
          <Skeleton className="h-4 w-6 shrink-0" />
          <div className="flex-1 flex flex-col gap-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function parseVerseReference(input: string): { book: BibleBook; chapter: number } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const match = trimmed.match(/^(.+?)\s+(\d+)(?::(\d+))?$/i);
  if (!match) {
    const bookOnly = BIBLE_BOOKS.find(
      (b) => b.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (bookOnly) return { book: bookOnly, chapter: 1 };
    return null;
  }

  const bookName = match[1].trim();
  const chapter = parseInt(match[2]);

  const book = BIBLE_BOOKS.find(
    (b) => b.name.toLowerCase() === bookName.toLowerCase()
  );
  if (!book) return null;
  if (chapter < 1 || chapter > book.chapters) return null;
  return { book, chapter };
}

const FREE_BIBLE_BOOK = "Genesis";

export default function BiblePage() {
  const [view, setView] = useState<ViewMode>("books");
  const [testament, setTestament] = useState<"old" | "new">("old");
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [highlightedVerses, setHighlightedVerses] = useState<Set<string>>(
    () => new Set(getHighlights().map((h) => h.id))
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [fontSize, setFontSizeState] = useState<FontSize>(getFontSize);
  const [showFontSettings, setShowFontSettings] = useState(false);
  const { toast } = useToast();
  const { isPremium, subscribe } = useSubscription();
  const searchString = useSearch();

  useEffect(() => {
    if (!searchString) return;
    const params = new URLSearchParams(searchString);
    const bookParam = params.get("book");
    const chapterParam = params.get("chapter");
    if (bookParam) {
      const decodedName = decodeURIComponent(bookParam);
      const book = BIBLE_BOOKS.find((b) => b.name === decodedName);
      if (book && (isPremium || book.name === FREE_BIBLE_BOOK)) {
        setSelectedBook(book);
        setSelectedChapter(chapterParam ? parseInt(chapterParam) || 1 : 1);
        setView("reading");
      }
    }
  }, [searchString, isPremium]);

  const fontClasses = getFontClasses(fontSize);

  const cachedData = useMemo(() => {
    if (view === "reading" && selectedBook) {
      return getCachedChapter(selectedBook.name, selectedChapter);
    }
    return null;
  }, [view, selectedBook, selectedChapter]);

  const { data: fetchedData, isLoading, error: chapterError } = useQuery<ChapterData>({
    queryKey: ["/api/bible", selectedBook?.name, selectedChapter],
    enabled: view === "reading" && !!selectedBook && !cachedData,
  });

  const chapterData = cachedData || fetchedData;

  useEffect(() => {
    if (fetchedData && selectedBook) {
      cacheChapter(selectedBook.name, selectedChapter, fetchedData);
    }
  }, [fetchedData, selectedBook, selectedChapter]);

  const isBookFree = useCallback((book: BibleBook) => {
    return book.name === FREE_BIBLE_BOOK || isPremium;
  }, [isPremium]);

  const handleBookSelect = useCallback((book: BibleBook) => {
    if (!isPremium && book.name !== FREE_BIBLE_BOOK) {
      subscribe();
      return;
    }
    setSelectedBook(book);
    setSelectedChapter(1);
    if (book.chapters === 1) {
      setView("reading");
    } else {
      setView("chapters");
    }
  }, [isPremium, subscribe]);

  const handleChapterSelect = useCallback((chapter: number) => {
    setSelectedChapter(chapter);
    setView("reading");
  }, []);

  const handleBack = useCallback(() => {
    if (view === "reading") {
      if (selectedBook && selectedBook.chapters === 1) {
        setView("books");
      } else {
        setView("chapters");
      }
    } else if (view === "chapters") {
      setView("books");
    }
  }, [view, selectedBook]);

  const handleVerseHighlight = useCallback(
    (verse: BibleVerse) => {
      if (!selectedBook) return;
      const wasHighlighted = toggleHighlight(
        selectedBook.name,
        selectedChapter,
        verse.verse,
        verse.text
      );
      const id = `${selectedBook.name}-${selectedChapter}-${verse.verse}`;
      setHighlightedVerses((prev) => {
        const next = new Set(prev);
        if (wasHighlighted) {
          next.add(id);
        } else {
          next.delete(id);
        }
        return next;
      });
      toast({
        title: wasHighlighted ? "Verse Highlighted" : "Highlight Removed",
        description: `${selectedBook.name} ${selectedChapter}:${verse.verse}`,
      });
    },
    [selectedBook, selectedChapter, toast]
  );

  const handlePrevChapter = useCallback(() => {
    if (selectedChapter > 1) {
      setSelectedChapter((c) => c - 1);
    }
  }, [selectedChapter]);

  const handleNextChapter = useCallback(() => {
    if (selectedBook && selectedChapter < selectedBook.chapters) {
      setSelectedChapter((c) => c + 1);
    }
  }, [selectedBook, selectedChapter]);

  const handleSearch = useCallback(() => {
    const result = parseVerseReference(searchQuery);
    if (!result) {
      toast({ title: "Not Found", description: "Try something like \"John 3\" or \"Psalms 23\"", variant: "destructive" });
      return;
    }
    if (!isPremium && result.book.name !== FREE_BIBLE_BOOK) {
      subscribe();
      return;
    }
    setSelectedBook(result.book);
    setSelectedChapter(result.chapter);
    setView("reading");
    setShowSearch(false);
    setSearchQuery("");
  }, [searchQuery, isPremium, subscribe, toast]);

  const handleFontSizeChange = useCallback((size: FontSize) => {
    setFontSizeState(size);
    setFontSize(size);
  }, []);

  const filteredBooks = BIBLE_BOOKS.filter((b) => b.testament === testament);

  return (
    <div className="pb-20">
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {view !== "books" && (
            <Button
              size="icon"
              variant="ghost"
              onClick={handleBack}
              data-testid="button-bible-back"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex-1 min-w-0">
            <h1
              className="font-serif text-2xl font-bold text-foreground"
              data-testid="text-bible-title"
            >
              {view === "books" && "King James Bible"}
              {view === "chapters" && selectedBook?.name}
              {view === "reading" &&
                `${selectedBook?.name} ${selectedChapter}`}
            </h1>
            {view === "books" && (
              <p className="mt-1 text-sm text-muted-foreground">
                Tap a book to start reading
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {view === "reading" && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowFontSettings(!showFontSettings)}
                data-testid="button-font-size"
              >
                <Type className="h-4 w-4" />
              </Button>
            )}
            {view === "books" && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowSearch(!showSearch)}
                data-testid="button-toggle-search"
              >
                {showSearch ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showSearch && view === "books" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder='e.g. "John 3" or "Psalms 23:1"'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    data-testid="input-bible-search"
                    autoFocus
                  />
                </div>
                <Button onClick={handleSearch} size="sm" data-testid="button-bible-search">
                  Go
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showFontSettings && view === "reading" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Text size:</span>
                {FONT_SIZE_OPTIONS.map((size) => (
                  <Badge
                    key={size}
                    variant={fontSize === size ? "default" : "outline"}
                    className={`cursor-pointer capitalize ${
                      fontSize === size
                        ? "bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground"
                    }`}
                    onClick={() => handleFontSizeChange(size)}
                    data-testid={`badge-font-${size}`}
                  >
                    {size}
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {view === "books" && (
          <motion.div
            key="books"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex gap-2 px-4 pb-3">
              <Badge
                variant={testament === "old" ? "default" : "outline"}
                className={`cursor-pointer ${
                  testament === "old"
                    ? "bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground"
                }`}
                onClick={() => setTestament("old")}
                data-testid="badge-old-testament"
              >
                Old Testament
              </Badge>
              <Badge
                variant={testament === "new" ? "default" : "outline"}
                className={`cursor-pointer ${
                  testament === "new"
                    ? "bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground"
                }`}
                onClick={() => setTestament("new")}
                data-testid="badge-new-testament"
              >
                New Testament
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 px-4 py-2">
              {filteredBooks.map((book) => {
                const free = isBookFree(book);
                return (
                  <Card
                    key={book.name}
                    className={`cursor-pointer overflow-visible p-3 hover-elevate ${!free ? "opacity-70" : ""}`}
                    onClick={() => handleBookSelect(book)}
                    data-testid={`card-book-${book.name.toLowerCase().replace(/ /g, "-")}`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {book.name}
                      </p>
                      {!free && <Lock className="h-3 w-3 text-muted-foreground shrink-0" />}
                      {book.name === FREE_BIBLE_BOOK && !isPremium && (
                        <span className="text-[8px] font-bold text-[#DFAC2A] uppercase">Free</span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {book.chapters} {book.chapters === 1 ? "chapter" : "chapters"}
                    </p>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        )}

        {view === "chapters" && selectedBook && (
          <motion.div
            key="chapters"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="grid grid-cols-5 gap-2 px-4 py-2">
              {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(
                (chapter) => (
                  <Button
                    key={chapter}
                    variant="outline"
                    className="h-12"
                    onClick={() => handleChapterSelect(chapter)}
                    data-testid={`button-chapter-${chapter}`}
                  >
                    {chapter}
                  </Button>
                )
              )}
            </div>
          </motion.div>
        )}

        {view === "reading" && selectedBook && (
          <motion.div
            key={`reading-${selectedBook.name}-${selectedChapter}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Highlighter className="h-3 w-3 text-primary" />
                <span>Tap any verse to highlight and save it</span>
              </div>
            </div>

            {isLoading && !cachedData && <ChapterSkeleton />}

            {chapterError && !isLoading && !cachedData && (
              <div className="flex flex-col items-center gap-4 px-4 py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <BookOpen className="h-7 w-7 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground" data-testid="text-bible-error">
                  Unable to load this chapter. Please check your connection and try again.
                </p>
              </div>
            )}

            {chapterData && (
              <div className="flex flex-col gap-1 px-4 py-2">
                {chapterData.verses.map((verse) => {
                  const id = `${selectedBook.name}-${selectedChapter}-${verse.verse}`;
                  const highlighted = highlightedVerses.has(id);
                  return (
                    <div
                      key={verse.verse}
                      className={`flex gap-2 rounded-md p-2 cursor-pointer transition-colors ${
                        highlighted
                          ? "bg-primary/15 border border-primary/20"
                          : "hover-elevate"
                      }`}
                      onClick={() => handleVerseHighlight(verse)}
                      data-testid={`verse-${selectedBook.name.toLowerCase().replace(/ /g, "-")}-${selectedChapter}-${verse.verse}`}
                    >
                      <span className="text-xs font-bold text-primary shrink-0 pt-0.5 w-6 text-right">
                        {verse.verse}
                      </span>
                      <p
                        className={`${fontClasses.verse} leading-relaxed ${
                          highlighted
                            ? "text-foreground font-medium"
                            : "text-foreground/90"
                        }`}
                        style={{ fontFamily: "'Lora', serif" }}
                      >
                        {verse.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedBook.chapters > 1 && (
              <div className="flex items-center justify-between gap-2 px-4 py-4 flex-wrap">
                <Button
                  variant="outline"
                  onClick={handlePrevChapter}
                  disabled={selectedChapter <= 1}
                  data-testid="button-prev-chapter"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  {selectedChapter} of {selectedBook.chapters}
                </span>
                <Button
                  variant="outline"
                  onClick={handleNextChapter}
                  disabled={selectedChapter >= selectedBook.chapters}
                  data-testid="button-next-chapter"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
