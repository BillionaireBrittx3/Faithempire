import { useState, useCallback, type MouseEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, BookOpen, Highlighter, Info } from "lucide-react";
import { toggleHighlight, getHighlights } from "@/lib/highlights";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

type ViewMode = "chapters" | "reading";

interface DecodedVerse {
  verse: number;
  kjv: string;
  decoded: string;
  context: string;
}

interface ChapterSummary {
  number: number;
  title: string;
  verseCount: number;
}

interface BookSummary {
  title: string;
  author: string;
  description: string;
  copyright: string;
  totalChapters: number;
  chapters: ChapterSummary[];
}

interface ChapterData {
  number: number;
  title: string;
  verses: DecodedVerse[];
}

function ChapterSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      ))}
    </div>
  );
}

const DECODED_BOOK_NAME = "Genesis Decoded";

export default function DecodedBookPage() {
  const [view, setView] = useState<ViewMode>("chapters");
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [expandedContext, setExpandedContext] = useState<Set<number>>(new Set());
  const [highlightedVerses, setHighlightedVerses] = useState<Set<string>>(
    () => new Set(getHighlights().filter(h => h.book === DECODED_BOOK_NAME).map(h => h.id))
  );
  const { toast } = useToast();

  const { data: bookSummary, isLoading: summaryLoading, error: summaryError } = useQuery<BookSummary>({
    queryKey: ["/api/decoded/genesis"],
  });

  const { data: chapterData, isLoading, error: chapterError } = useQuery<ChapterData>({
    queryKey: ["/api/decoded/genesis", selectedChapter],
    enabled: view === "reading",
  });

  const handleChapterSelect = useCallback((chapter: number) => {
    setSelectedChapter(chapter);
    setExpandedContext(new Set());
    setView("reading");
  }, []);

  const handleBack = useCallback(() => {
    setView("chapters");
    setExpandedContext(new Set());
  }, []);

  const handleVerseHighlight = useCallback(
    (verse: DecodedVerse) => {
      const wasHighlighted = toggleHighlight(
        DECODED_BOOK_NAME,
        selectedChapter,
        verse.verse,
        verse.decoded
      );
      const id = `${DECODED_BOOK_NAME}-${selectedChapter}-${verse.verse}`;
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
        description: `Genesis ${selectedChapter}:${verse.verse}`,
      });
    },
    [selectedChapter, toast]
  );

  const toggleContext = useCallback((verseNum: number, e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setExpandedContext((prev) => {
      const next = new Set(prev);
      if (next.has(verseNum)) {
        next.delete(verseNum);
      } else {
        next.add(verseNum);
      }
      return next;
    });
  }, []);

  const handlePrevChapter = useCallback(() => {
    if (selectedChapter > 1) {
      setSelectedChapter((c) => c - 1);
      setExpandedContext(new Set());
    }
  }, [selectedChapter]);

  const handleNextChapter = useCallback(() => {
    if (bookSummary && selectedChapter < bookSummary.totalChapters) {
      setSelectedChapter((c) => c + 1);
      setExpandedContext(new Set());
    }
  }, [bookSummary, selectedChapter]);

  const currentChapterInfo = bookSummary?.chapters.find(
    (ch) => ch.number === selectedChapter
  );

  return (
    <div className="pb-20">
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {view === "reading" && (
            <Button
              size="icon"
              variant="ghost"
              onClick={handleBack}
              data-testid="button-decoded-back"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex-1 min-w-0">
            <h1
              className="font-serif text-2xl font-bold text-foreground"
              data-testid="text-decoded-title"
            >
              {view === "chapters" && "Genesis Decoded"}
              {view === "reading" && `Chapter ${selectedChapter}`}
            </h1>
            {view === "chapters" && (
              <p className="mt-1 text-sm text-muted-foreground">
                KJV translated into modern language
              </p>
            )}
            {view === "reading" && currentChapterInfo && (
              <p className="mt-0.5 text-xs text-primary">
                {currentChapterInfo.title}
              </p>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === "chapters" && (
          <motion.div
            key="chapters"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-3">
              <Card className="p-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {bookSummary?.description || "Every sentence of Genesis translated into modern, plain English with contextual clarification."}
                </p>
                <p className="mt-2 text-[10px] text-muted-foreground/70">
                  By {bookSummary?.author || "Brittany Johnson"} &middot; {bookSummary?.copyright || "\u00a9 2025"}
                </p>
              </Card>
            </div>

            {summaryLoading && (
              <div className="flex flex-col gap-2 px-4 py-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-md" />
                ))}
              </div>
            )}

            {summaryError && !summaryLoading && (
              <div className="flex flex-col items-center gap-4 px-4 py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <BookOpen className="h-7 w-7 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground" data-testid="text-summary-error">
                  Unable to load the book. Please try again.
                </p>
              </div>
            )}

            {bookSummary && (
            <div className="flex flex-col gap-1.5 px-4 py-2">
              {bookSummary.chapters.map((ch) => (
                <Card
                  key={ch.number}
                  className="cursor-pointer overflow-visible p-3 hover-elevate"
                  onClick={() => handleChapterSelect(ch.number)}
                  data-testid={`card-decoded-chapter-${ch.number}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-primary w-8 text-center shrink-0">
                      {ch.number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {ch.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {ch.verseCount} verses
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                </Card>
              ))}
            </div>
            )}
          </motion.div>
        )}

        {view === "reading" && (
          <motion.div
            key={`reading-${selectedChapter}`}
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
                <p className="text-sm text-muted-foreground" data-testid="text-decoded-error">
                  Unable to load this chapter. Please try again.
                </p>
              </div>
            )}

            {chapterData && (
              <div className="flex flex-col gap-2 px-4 py-2">
                {chapterData.verses.map((verse) => {
                  const id = `${DECODED_BOOK_NAME}-${selectedChapter}-${verse.verse}`;
                  const highlighted = highlightedVerses.has(id);
                  const showContext = expandedContext.has(verse.verse);
                  return (
                    <div
                      key={verse.verse}
                      className={`rounded-md p-3 cursor-pointer transition-colors ${
                        highlighted
                          ? "bg-primary/15 border border-primary/20"
                          : "hover-elevate"
                      }`}
                      onClick={() => handleVerseHighlight(verse)}
                      data-testid={`verse-decoded-${selectedChapter}-${verse.verse}`}
                    >
                      <div className="flex gap-2">
                        <span className="text-xs font-bold text-primary shrink-0 pt-0.5 w-6 text-right">
                          {verse.verse}
                        </span>
                        <div className="flex-1 flex flex-col gap-2">
                          <p
                            className="text-xs leading-relaxed text-muted-foreground italic"
                            style={{ fontFamily: "'Lora', serif" }}
                          >
                            {verse.kjv}
                          </p>
                          <p
                            className={`text-sm leading-relaxed ${
                              highlighted
                                ? "text-foreground font-medium"
                                : "text-foreground/90"
                            }`}
                            style={{ fontFamily: "'DM Sans', sans-serif" }}
                          >
                            {verse.decoded}
                          </p>
                          {verse.context && (
                            <>
                              <button
                                onClick={(e) => toggleContext(verse.verse, e)}
                                className="flex items-center gap-1 text-[10px] text-primary/80 self-start"
                                data-testid={`button-context-${selectedChapter}-${verse.verse}`}
                              >
                                <Info className="h-3 w-3" />
                                {showContext ? "Hide context" : "Show context"}
                              </button>
                              {showContext && (
                                <motion.p
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="text-xs leading-relaxed text-muted-foreground/80 pl-2 border-l-2 border-primary/20"
                                >
                                  {verse.context}
                                </motion.p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-between gap-2 px-4 py-4 flex-wrap">
              <Button
                variant="outline"
                onClick={handlePrevChapter}
                disabled={selectedChapter <= 1}
                data-testid="button-decoded-prev"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedChapter} of {bookSummary?.totalChapters || 50}
              </span>
              <Button
                variant="outline"
                onClick={handleNextChapter}
                disabled={selectedChapter >= (bookSummary?.totalChapters || 50)}
                data-testid="button-decoded-next"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="px-4 pb-4">
              <p className="text-[10px] text-center text-muted-foreground/60">
                {bookSummary?.copyright || "\u00a9 2025 Brittany Johnson. All rights reserved."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
