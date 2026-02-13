import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, BookOpen, Highlighter } from "lucide-react";
import { BIBLE_BOOKS, type BibleBook } from "@/lib/bible-data";
import { isHighlighted, toggleHighlight, getHighlights } from "@/lib/highlights";
import { useToast } from "@/hooks/use-toast";
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

export default function BiblePage() {
  const [view, setView] = useState<ViewMode>("books");
  const [testament, setTestament] = useState<"old" | "new">("old");
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [highlightedVerses, setHighlightedVerses] = useState<Set<string>>(
    () => new Set(getHighlights().map((h) => h.id))
  );
  const { toast } = useToast();

  const { data: chapterData, isLoading, error: chapterError } = useQuery<ChapterData>({
    queryKey: ["/api/bible", selectedBook?.name, selectedChapter],
    enabled: view === "reading" && !!selectedBook,
  });

  const handleBookSelect = useCallback((book: BibleBook) => {
    setSelectedBook(book);
    setSelectedChapter(1);
    if (book.chapters === 1) {
      setView("reading");
    } else {
      setView("chapters");
    }
  }, []);

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
        </div>
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
              {filteredBooks.map((book) => (
                <Card
                  key={book.name}
                  className="cursor-pointer overflow-visible p-3 hover-elevate"
                  onClick={() => handleBookSelect(book)}
                  data-testid={`card-book-${book.name.toLowerCase().replace(/ /g, "-")}`}
                >
                  <p className="text-sm font-semibold text-foreground truncate">
                    {book.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {book.chapters} {book.chapters === 1 ? "chapter" : "chapters"}
                  </p>
                </Card>
              ))}
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

            {isLoading && <ChapterSkeleton />}

            {chapterError && !isLoading && (
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
                        className={`text-sm leading-relaxed ${
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
