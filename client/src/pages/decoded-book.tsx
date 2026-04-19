import { useState, useCallback, useEffect, useRef, type MouseEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, BookOpen, Highlighter, Info, Check, Type, Volume2, Play, Pause, Square } from "lucide-react";
import { toggleHighlight, getHighlights } from "@/lib/highlights";
import { BOOK_SUMMARIES } from "@/lib/bible-summaries";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useSubscription, FREE_DECODED_CHAPTERS } from "@/lib/subscription";
import { PremiumLock, PremiumBadge } from "@/components/premium-lock";
import { markChapterRead, isChapterRead, getBookProgress } from "@/lib/reading-progress";
import { getFontSize, setFontSize, getFontClasses, FONT_SIZE_OPTIONS, type FontSize } from "@/lib/font-size";
import { useSpeech } from "@/lib/use-speech";
import { SpeechControls } from "@/components/speech-controls";

type ListenMode = "decoded" | "kjv";
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
  bookName: string;
  slug: string;
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

import { useRequirePremium } from "@/components/paywall-modal";

export default function DecodedBookPage({ bookSlug }: { bookSlug: string }) {
  useRequirePremium(
    bookSlug === "genesis" ? null : `Unlock ${bookSlug} Decoded`,
  );
  const [view, setView] = useState<ViewMode>("chapters");
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [expandedContext, setExpandedContext] = useState<Set<number>>(new Set());
  const [highlightedVerses, setHighlightedVerses] = useState<Set<string>>(
    () => new Set(getHighlights().filter(h => h.book.includes("Decoded")).map(h => h.id))
  );
  const [readChapters, setReadChapters] = useState<Set<number>>(new Set());
  const [fontSize, setFontSizeState] = useState<FontSize>(getFontSize);
  const [showFontSettings, setShowFontSettings] = useState(false);
  const [showSpeechControls, setShowSpeechControls] = useState(false);
  const [listenMode, setListenMode] = useState<ListenMode>("decoded");
  const { toast } = useToast();
  const { isPremium } = useSubscription();
  const autoAdvanceRef = useRef(false);
  const masterPlayRef = useRef(false);
  const listenModeRef = useRef<ListenMode>("decoded");

  const fontClasses = getFontClasses(fontSize);
  const isGenesisBook = bookSlug === "genesis";
  const isChapterLocked = (chapterNum: number) => !isPremium && !isGenesisBook && chapterNum > FREE_DECODED_CHAPTERS;

  const { data: bookSummary, isLoading: summaryLoading, error: summaryError } = useQuery<BookSummary>({
    queryKey: ["/api/decoded", bookSlug],
  });

  const bookName = bookSummary?.bookName || bookSlug;
  const decodedBookName = `${bookName} Decoded`;

  const handleChapterComplete = useCallback(() => {
    const totalChapters = bookSummary?.totalChapters || 0;
    if (selectedChapter < totalChapters) {
      const nextChapter = selectedChapter + 1;
      if (!isChapterLocked(nextChapter)) {
        autoAdvanceRef.current = true;
        setSelectedChapter(nextChapter);
        setExpandedContext(new Set());
      }
    }
  }, [bookSummary, selectedChapter]);

  const speech = useSpeech(handleChapterComplete);

  const { data: chapterData, isLoading, error: chapterError } = useQuery<ChapterData>({
    queryKey: ["/api/decoded", bookSlug, selectedChapter],
    enabled: view === "reading" && !isChapterLocked(selectedChapter),
  });

  useEffect(() => {
    listenModeRef.current = listenMode;
  }, [listenMode]);

  useEffect(() => {
    const chapters = bookSummary?.chapters || [];
    const readSet = new Set<number>();
    chapters.forEach((ch) => {
      if (isChapterRead(bookSlug, ch.number)) readSet.add(ch.number);
    });
    setReadChapters(readSet);
  }, [bookSlug, bookSummary]);

  useEffect(() => {
    const shouldAutoStart = autoAdvanceRef.current || masterPlayRef.current;
    if (shouldAutoStart && chapterData && view === "reading") {
      autoAdvanceRef.current = false;
      masterPlayRef.current = false;
      const verses = chapterData.verses.map((v) => ({
        verse: v.verse,
        text: listenModeRef.current === "decoded" ? v.decoded : v.kjv,
      }));
      speech.startSpeaking({
        verses,
        bookName: decodedBookName,
        chapter: selectedChapter,
      });
    }
  }, [chapterData, selectedChapter, decodedBookName, speech, view]);

  useEffect(() => {
    if (view === "reading" && chapterData && !isChapterLocked(selectedChapter)) {
      markChapterRead(bookSlug, selectedChapter);
      setReadChapters((prev) => {
        const next = new Set(prev);
        next.add(selectedChapter);
        return next;
      });
    }
  }, [view, chapterData, selectedChapter, bookSlug]);

  const progress = bookSummary ? getBookProgress(bookSlug, bookSummary.totalChapters) : 0;

  const handleMasterPlay = useCallback(() => {
    if (speech.isSpeaking) {
      speech.stopSpeaking();
      setShowSpeechControls(false);
      return;
    }
    if (!speech.continuousPlay) {
      speech.toggleContinuousPlay();
    }
    masterPlayRef.current = true;
    setExpandedContext(new Set());
    setShowSpeechControls(true);
    setSelectedChapter(1);
    setView("reading");
  }, [speech]);

  const handleChapterSelect = useCallback((chapter: number) => {
    setSelectedChapter(chapter);
    setExpandedContext(new Set());
    setView("reading");
  }, []);

  const handleBack = useCallback(() => {
    speech.stopSpeaking();
    setShowSpeechControls(false);
    setView("chapters");
    setExpandedContext(new Set());
  }, [speech]);

  const handleVerseHighlight = useCallback(
    (verse: DecodedVerse) => {
      const wasHighlighted = toggleHighlight(
        decodedBookName,
        selectedChapter,
        verse.verse,
        verse.decoded
      );
      const id = `${decodedBookName}-${selectedChapter}-${verse.verse}`;
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
        description: `${bookName} ${selectedChapter}:${verse.verse}`,
      });
    },
    [selectedChapter, toast, bookName, decodedBookName]
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
    speech.stopSpeaking();
    if (selectedChapter > 1) {
      setSelectedChapter((c) => c - 1);
      setExpandedContext(new Set());
    }
  }, [selectedChapter, speech]);

  const handleNextChapter = useCallback(() => {
    speech.stopSpeaking();
    if (bookSummary && selectedChapter < bookSummary.totalChapters) {
      setSelectedChapter((c) => c + 1);
      setExpandedContext(new Set());
    }
  }, [bookSummary, selectedChapter, speech]);

  const handleFontSizeChange = useCallback((size: FontSize) => {
    setFontSizeState(size);
    setFontSize(size);
  }, []);

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
              {view === "chapters" && (bookSummary?.bookName || bookSlug)}
              {view === "reading" && `Chapter ${selectedChapter}`}
            </h1>
            {view === "chapters" && (
              <p className="mt-1 text-sm text-muted-foreground">
                Decoded into modern language (DMLV)
              </p>
            )}
            {view === "reading" && currentChapterInfo?.title && (
              <p className="mt-0.5 text-xs text-primary">
                {currentChapterInfo.title}
              </p>
            )}
          </div>
          {view === "reading" && (
            <>
              <Button
                size="icon"
                variant={showSpeechControls ? "default" : "ghost"}
                onClick={() => {
                  setShowSpeechControls(!showSpeechControls);
                  if (showSpeechControls) speech.stopSpeaking();
                }}
                data-testid="button-decoded-listen"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowFontSettings(!showFontSettings)}
                data-testid="button-decoded-font-size"
              >
                <Type className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

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
                    data-testid={`badge-decoded-font-${size}`}
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
                  {bookSummary?.description || "Every verse decoded into plain, modern English."}
                </p>
                <p className="mt-2 text-[10px] text-muted-foreground/70">
                  By {bookSummary?.author || "Brittany Johnson"} &middot; {bookSummary?.copyright || "© 2026"}
                </p>
                {progress > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-primary font-medium">{progress}% complete</span>
                      <span className="text-[10px] text-muted-foreground">
                        {readChapters.size}/{bookSummary?.totalChapters || 0} chapters
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-primary/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {bookSummary && BOOK_SUMMARIES[bookName] && (
              <div className="px-4 pb-3">
                <Card className="p-4 border-primary/30 bg-primary/5" data-testid="text-decoded-book-summary">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-primary uppercase tracking-wide">What This Book Is About</span>
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {BOOK_SUMMARIES[bookName]}
                  </p>
                </Card>
              </div>
            )}

            {bookSummary && (
              <div className="px-4 pb-3">
                <Button
                  className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-5 text-sm"
                  onClick={handleMasterPlay}
                  data-testid="button-master-play"
                >
                  {speech.isSpeaking ? (
                    <>
                      <Square className="h-4 w-4 fill-current" />
                      Stop Listening
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-current" />
                      Listen to Entire Book
                    </>
                  )}
                </Button>
                <p className="mt-1.5 text-[10px] text-center text-muted-foreground/60">
                  Plays all chapters from start to finish
                </p>
              </div>
            )}

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
              {bookSummary.chapters.map((ch) => {
                const locked = isChapterLocked(ch.number);
                const read = readChapters.has(ch.number);
                return (
                <Card
                  key={ch.number}
                  className={`overflow-visible p-3 cursor-pointer ${locked ? "opacity-60" : "hover-elevate"}`}
                  onClick={() => handleChapterSelect(ch.number)}
                  data-testid={`card-decoded-chapter-${ch.number}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <span className={`text-lg font-bold w-8 text-center shrink-0 block ${locked ? "text-muted-foreground" : read ? "text-primary" : "text-primary"}`}>
                        {ch.number}
                      </span>
                      {read && (
                        <Check className="absolute -top-1 -right-1 h-3 w-3 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {ch.title || `Chapter ${ch.number}`}
                        </p>
                        {locked && <PremiumBadge />}
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {ch.verseCount} verses
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                </Card>
                );
              })}
            </div>
            )}
          </motion.div>
        )}

        {view === "reading" && isChapterLocked(selectedChapter) && (
          <motion.div
            key="locked"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PremiumLock
              title={`Chapter ${selectedChapter} is Premium`}
              description={`Chapters ${FREE_DECODED_CHAPTERS + 1}+ require a premium subscription`}
            />
          </motion.div>
        )}

        {view === "reading" && !isChapterLocked(selectedChapter) && (
          <motion.div
            key={`reading-${selectedChapter}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {selectedChapter === 1 && BOOK_SUMMARIES[bookName] && (
              <div className="px-4 pb-3">
                <Card className="p-4 border-primary/30 bg-primary/5" data-testid="text-decoded-book-summary-reading">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-primary uppercase tracking-wide">What This Book Is About</span>
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {BOOK_SUMMARIES[bookName]}
                  </p>
                </Card>
              </div>
            )}

            <div className="px-4 pb-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Highlighter className="h-3 w-3 text-primary" />
                <span>Tap any verse to highlight and save it</span>
              </div>
            </div>

            {showSpeechControls && chapterData && (
              <SpeechControls
                isSpeaking={speech.isSpeaking}
                isPaused={speech.isPaused}
                speed={speech.speed}
                continuousPlay={speech.continuousPlay}
                onPlay={() => {
                  const verses = chapterData.verses.map((v) => ({
                    verse: v.verse,
                    text: listenMode === "decoded" ? v.decoded : v.kjv,
                  }));
                  speech.startSpeaking({
                    verses,
                    bookName: decodedBookName,
                    chapter: selectedChapter,
                  });
                }}
                onPause={speech.togglePause}
                onStop={speech.stopSpeaking}
                onSpeedChange={speech.changeSpeed}
                onContinuousToggle={speech.toggleContinuousPlay}
                showModeToggle
                mode={listenMode}
                onModeChange={(mode) => {
                  setListenMode(mode);
                  if (speech.isSpeaking) {
                    speech.stopSpeaking();
                  }
                }}
                totalChapters={bookSummary?.totalChapters}
                currentChapter={selectedChapter}
                bookName={bookName}
              />
            )}

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
                  const id = `${decodedBookName}-${selectedChapter}-${verse.verse}`;
                  const highlighted = highlightedVerses.has(id);
                  const showContext = expandedContext.has(verse.verse);
                  const isActiveVerse = speech.isSpeaking && speech.activeVerse === verse.verse;
                  return (
                    <div
                      key={verse.verse}
                      className={`rounded-md p-3 cursor-pointer transition-colors ${
                        isActiveVerse
                          ? "bg-primary/25 border border-primary/40 ring-1 ring-primary/30"
                          : highlighted
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
                            className={`${fontClasses.verse} leading-relaxed text-muted-foreground italic`}
                            style={{ fontFamily: "'Lora', serif" }}
                          >
                            {verse.kjv}
                          </p>
                          <p
                            className={`${fontClasses.body} leading-relaxed ${
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
                {selectedChapter} of {bookSummary?.totalChapters || "?"}
              </span>
              <Button
                variant="outline"
                onClick={handleNextChapter}
                disabled={selectedChapter >= (bookSummary?.totalChapters || 1)}
                data-testid="button-decoded-next"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="px-4 pb-4">
              <p className="text-[10px] text-center text-muted-foreground/60">
                {bookSummary?.copyright || "© 2026 Brittany Johnson. All rights reserved."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
