import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

interface BookEntry {
  bookName: string;
  slug: string;
  totalChapters: number;
  totalVerses: number;
  description: string;
}

const OT_SECTIONS = [
  { label: "The Law", range: ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy"] },
  { label: "History", range: ["Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther"] },
  { label: "Wisdom & Poetry", range: ["Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon"] },
  { label: "Major Prophets", range: ["Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel"] },
  { label: "Minor Prophets", range: ["Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"] },
];

const NT_SECTIONS = [
  { label: "Gospels", range: ["Matthew", "Mark", "Luke", "John"] },
  { label: "History", range: ["Acts"] },
  { label: "Paul's Letters", range: ["Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon"] },
  { label: "General Letters", range: ["Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude"] },
  { label: "Prophecy", range: ["Revelation"] },
];

function BookCard({ book, index }: { book: BookEntry; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.5) }}
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

function SectionGroup({ label, bookNames, allBooks, startIndex }: { label: string; bookNames: string[]; allBooks: BookEntry[]; startIndex: number }) {
  const books = bookNames
    .map(name => allBooks.find(b => b.bookName === name))
    .filter((b): b is BookEntry => !!b);

  if (books.length === 0) return null;

  return (
    <div className="mb-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-primary/70 px-1 mb-1.5">
        {label}
      </p>
      <div className="flex flex-col gap-1.5">
        {books.map((book, i) => (
          <BookCard key={book.slug} book={book} index={startIndex + i} />
        ))}
      </div>
    </div>
  );
}

export default function DecodedPage() {
  const { data: books, isLoading } = useQuery<BookEntry[]>({
    queryKey: ["/api/decoded/books"],
  });

  const totalBooks = books?.length || 0;
  const totalVerses = books?.reduce((sum, b) => sum + b.totalVerses, 0) || 0;

  let runningIndex = 0;

  return (
    <div className="pb-20">
      <div className="px-4 pt-5 pb-3">
        <h1
          className="font-serif text-2xl font-bold text-foreground"
          data-testid="text-decoded-landing-title"
        >
          Decoded Books
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The entire Bible decoded sentence-by-sentence into plain, modern English
        </p>
        {books && (
          <p className="mt-1 text-xs text-primary/80">
            {totalBooks} books &middot; {totalVerses.toLocaleString()} verses decoded
          </p>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2 px-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md" />
          ))}
        </div>
      )}

      {books && (
        <div className="px-4">
          <div className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground/80 mb-3 border-b border-border pb-1">
              Old Testament
            </h2>
            {OT_SECTIONS.map(section => {
              const idx = runningIndex;
              const count = section.range.filter(n => books.some(b => b.bookName === n)).length;
              runningIndex += count;
              return (
                <SectionGroup
                  key={section.label + "-ot"}
                  label={section.label}
                  bookNames={section.range}
                  allBooks={books}
                  startIndex={idx}
                />
              );
            })}
          </div>

          <div className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground/80 mb-3 border-b border-border pb-1">
              New Testament
            </h2>
            {NT_SECTIONS.map(section => {
              const idx = runningIndex;
              const count = section.range.filter(n => books.some(b => b.bookName === n)).length;
              runningIndex += count;
              return (
                <SectionGroup
                  key={section.label + "-nt"}
                  label={section.label}
                  bookNames={section.range}
                  allBooks={books}
                  startIndex={idx}
                />
              );
            })}
          </div>
        </div>
      )}

      <div className="px-4 pt-2">
        <p className="text-[10px] text-center text-muted-foreground/60">
          By Brittany Johnson &middot; decodedfaithempire.org
        </p>
      </div>
    </div>
  );
}
