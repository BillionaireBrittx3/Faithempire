import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, BookOpen, Cross } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

interface BookEntry {
  bookName: string;
  slug: string;
  totalChapters: number;
  totalVerses: number;
  description: string;
}

const SERIES = [
  {
    id: 1,
    label: "Series I",
    title: "The Law",
    subtitle: "Genesis – Deuteronomy",
    books: ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy"],
  },
  {
    id: 2,
    label: "Series II",
    title: "History",
    subtitle: "Joshua – Job",
    books: ["Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job"],
  },
  {
    id: 3,
    label: "Series III",
    title: "Wisdom, Poetry & Prophets",
    subtitle: "Psalms – Malachi",
    books: ["Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"],
  },
  {
    id: 4,
    label: "Series IV",
    title: "The New Testament",
    subtitle: "Matthew – Revelation",
    books: ["Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"],
  },
];

function BookCard({ book, index }: { book: BookEntry; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.6) }}
    >
      <Link href={`/decoded/${book.slug}`}>
        <Card
          className="cursor-pointer overflow-visible p-3 hover-elevate"
          data-testid={`card-decoded-book-${book.slug}`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {book.bookName}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {book.totalChapters} chapters &middot; {book.totalVerses.toLocaleString()} verses
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

import { useRequirePremium } from "@/components/paywall-modal";

export default function DecodedPage() {
  useRequirePremium("Unlock all 66 decoded books");
  const [activeSeriesId, setActiveSeriesId] = useState(1);

  const { data: books, isLoading, error } = useQuery<BookEntry[]>({
    queryKey: ["/api/decoded/books"],
  });

  const totalBooks = books?.length || 0;
  const totalVerses = books?.reduce((sum, b) => sum + b.totalVerses, 0) || 0;

  const activeSeries = SERIES.find(s => s.id === activeSeriesId)!;
  const seriesBooks = activeSeries.books
    .map(name => books?.find(b => b.bookName === name))
    .filter((b): b is BookEntry => !!b);

  const seriesVerses = seriesBooks.reduce((sum, b) => sum + b.totalVerses, 0);

  return (
    <div className="pb-20">
      <div className="px-4 pt-5 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <Cross className="h-5 w-5 text-primary" />
          <h1
            className="font-serif text-2xl font-bold text-foreground"
            data-testid="text-decoded-landing-title"
          >
            Breaking Down the Bible
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          The entire Bible decoded sentence-by-sentence into today's language
        </p>
        {books && (
          <p className="mt-1 text-xs text-primary/80">
            {totalBooks} books &middot; {totalVerses.toLocaleString()} verses decoded
          </p>
        )}
      </div>

      <div className="px-4 pt-3 pb-1">
        <div
          className="flex flex-wrap gap-2"
          data-testid="tabs-series"
        >
          {SERIES.map(series => (
            <Button
              key={series.id}
              size="sm"
              variant={activeSeriesId === series.id ? "default" : "outline"}
              onClick={() => setActiveSeriesId(series.id)}
              data-testid={`tab-series-${series.id}`}
            >
              {series.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-3 pb-2">
        <Card className="p-4 border-primary/20 bg-primary/5" data-testid="card-series-summary">
          <h2
            className="font-serif text-lg font-bold text-foreground"
            data-testid="text-series-title"
          >
            {activeSeries.label}: {activeSeries.title}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5" data-testid="text-series-subtitle">
            {activeSeries.subtitle}
          </p>
          {books && (
            <p className="text-[10px] text-primary mt-1" data-testid="text-series-stats">
              {seriesBooks.length} books &middot; {seriesVerses.toLocaleString()} verses
            </p>
          )}
        </Card>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2 px-4 pt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md" />
          ))}
        </div>
      )}

      {error && !isLoading && (
        <div className="flex flex-col items-center gap-4 px-4 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <BookOpen className="h-7 w-7 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground" data-testid="text-decoded-list-error">
            Unable to load the decoded books. Please try again later.
          </p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {books && (
          <motion.div
            key={activeSeriesId}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-1.5 px-4 pt-2"
          >
            {seriesBooks.map((book, i) => (
              <BookCard key={book.slug} book={book} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-4 pt-4">
        <p className="text-[10px] text-center text-muted-foreground/60">
          By Brittany Johnson &middot; decodedfaithempire.org
        </p>
      </div>
    </div>
  );
}
