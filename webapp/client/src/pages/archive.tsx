import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import { VerseCard } from "@/components/verse-card";
import type { Verse } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  "All",
  "Faith & Trust",
  "Strength & Overcoming",
  "Purpose & Destiny",
  "Provision & Abundance",
  "Peace & Comfort",
  "Wisdom & Guidance",
  "Love & Relationships",
  "Success & Hard Work",
  "Courage & Boldness",
  "Forgiveness & Grace",
  "Joy & Gratitude",
  "Hope & The Future",
];

function ArchiveSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-full max-w-[280px]" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function ArchivePage() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: verses, isLoading } = useQuery<Verse[]>({
    queryKey: ["/api/verses/archive"],
  });

  const filteredVerses = verses?.filter(
    (v) => selectedCategory === "All" || v.category === selectedCategory
  );

  return (
    <div className="pb-20">
      <div className="px-4 pt-5 pb-3">
        <h1 className="font-serif text-2xl font-bold text-foreground" data-testid="text-archive-title">
          Verse Archive
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse past verses and discover new inspiration
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <Badge
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            className={`cursor-pointer whitespace-nowrap ${
              selectedCategory === cat
                ? "bg-primary text-primary-foreground"
                : "border-border text-muted-foreground"
            }`}
            onClick={() => setSelectedCategory(cat)}
            data-testid={`badge-category-${cat.toLowerCase().replace(/ /g, "-")}`}
          >
            {cat}
          </Badge>
        ))}
      </div>

      {isLoading && <ArchiveSkeleton />}

      {filteredVerses && filteredVerses.length === 0 && (
        <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No verses found in this category yet.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 px-4 py-2">
        <AnimatePresence mode="popLayout">
          {filteredVerses?.map((verse, index) => (
            <motion.div
              key={verse.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, delay: index * 0.03 }}
            >
              <Card
                className="cursor-pointer overflow-visible p-4 hover-elevate"
                onClick={() =>
                  setExpandedId(expandedId === verse.id ? null : verse.id)
                }
                data-testid={`card-archive-verse-${verse.id}`}
              >
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-medium text-muted-foreground">
                        #{verse.verseNumber}
                      </p>
                      <Badge variant="outline" className="text-[10px] border-primary/20 text-primary">
                        {verse.category}
                      </Badge>
                    </div>
                    <p className="mt-1.5 font-serif text-base font-semibold text-foreground">
                      {verse.reference}
                    </p>
                    {expandedId !== verse.id && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {verse.decodedMessage}
                      </p>
                    )}
                  </div>
                  <div className="text-muted-foreground">
                    {expandedId === verse.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === verse.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 border-t border-border pt-3">
                        <VerseCard verse={verse} showFullCard />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
