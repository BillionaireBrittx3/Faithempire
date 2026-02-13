import { Card } from "@/components/ui/card";
import { ChevronRight, Cross } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

const decodedBooks = [
  {
    slug: "genesis",
    title: "The Book of Genesis Decoded",
    shortTitle: "Genesis",
    author: "Brittany Johnson",
    chapters: 50,
    verses: 1533,
    description: "Every sentence of Genesis translated into modern, plain English with contextual clarification.",
  },
];

export default function DecodedPage() {
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
          The Bible rewritten sentence-by-sentence into today's language
        </p>
      </div>

      <div className="flex flex-col gap-3 px-4 py-2">
        {decodedBooks.map((book, i) => (
          <motion.div
            key={book.slug}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <Link href={`/decoded/${book.slug}`}>
              <Card
                className="cursor-pointer overflow-visible p-4 hover-elevate"
                data-testid={`card-decoded-book-${book.slug}`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15">
                    <Cross className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-foreground">
                      {book.shortTitle}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {book.chapters} chapters &middot; {book.verses} verses
                    </p>
                    <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-2">
                      {book.description}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <Card className="p-4 border-dashed">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted">
                <Cross className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">
                  More books coming soon
                </p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  Stay tuned for additional decoded books
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="px-4 pt-4">
        <p className="text-[10px] text-center text-muted-foreground/60">
          By Brittany Johnson &middot; decodedfaithempire.org
        </p>
      </div>
    </div>
  );
}
