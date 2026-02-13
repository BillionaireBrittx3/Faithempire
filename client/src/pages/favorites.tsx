import { useState, useEffect, useCallback } from "react";
import { Heart, Trash2, Highlighter, Book } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VerseCard } from "@/components/verse-card";
import { getFavorites, removeFavorite } from "@/lib/favorites";
import { getHighlights, removeHighlight, type BibleHighlight } from "@/lib/highlights";
import type { Verse } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

type TabType = "favorites" | "highlights";

export default function FavoritesPage() {
  const [activeTab, setActiveTab] = useState<TabType>("favorites");
  const [favorites, setFavorites] = useState<Verse[]>([]);
  const [highlights, setHighlights] = useState<BibleHighlight[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { toast } = useToast();

  const loadFavorites = useCallback(() => {
    setFavorites(getFavorites());
  }, []);

  const loadHighlights = useCallback(() => {
    setHighlights(getHighlights());
  }, []);

  useEffect(() => {
    loadFavorites();
    loadHighlights();
  }, [loadFavorites, loadHighlights]);

  const handleRemove = useCallback((verseId: number) => {
    removeFavorite(verseId);
    setFavorites((prev) => prev.filter((v) => v.id !== verseId));
    toast({ title: "Verse Removed", description: "Removed from your saved verses" });
  }, [toast]);

  const handleRemoveHighlight = useCallback((h: BibleHighlight) => {
    removeHighlight(h.book, h.chapter, h.verse);
    setHighlights((prev) => prev.filter((x) => x.id !== h.id));
    toast({ title: "Highlight Removed", description: `${h.book} ${h.chapter}:${h.verse}` });
  }, [toast]);

  return (
    <div className="pb-20">
      <div className="px-4 pt-5 pb-3">
        <h1 className="font-serif text-2xl font-bold text-foreground" data-testid="text-favorites-title">
          Saved
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your favorite verses and Bible highlights
        </p>
      </div>

      <div className="flex gap-2 px-4 pb-3">
        <Badge
          variant={activeTab === "favorites" ? "default" : "outline"}
          className={`cursor-pointer ${
            activeTab === "favorites"
              ? "bg-primary text-primary-foreground"
              : "border-border text-muted-foreground"
          }`}
          onClick={() => setActiveTab("favorites")}
          data-testid="badge-tab-favorites"
        >
          <Heart className="h-3 w-3 mr-1" />
          Favorites ({favorites.length})
        </Badge>
        <Badge
          variant={activeTab === "highlights" ? "default" : "outline"}
          className={`cursor-pointer ${
            activeTab === "highlights"
              ? "bg-primary text-primary-foreground"
              : "border-border text-muted-foreground"
          }`}
          onClick={() => setActiveTab("highlights")}
          data-testid="badge-tab-highlights"
        >
          <Highlighter className="h-3 w-3 mr-1" />
          Highlights ({highlights.length})
        </Badge>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "favorites" && (
          <motion.div
            key="favorites"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {favorites.length === 0 && (
              <div className="flex flex-col items-center gap-4 px-4 py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Heart className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="font-serif text-lg font-semibold text-foreground" data-testid="text-no-favorites">
                    No saved verses yet
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Tap the heart on any verse to save it here
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 px-4 py-2">
              <AnimatePresence mode="popLayout">
                {favorites.map((verse) => (
                  <motion.div
                    key={verse.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.25 }}
                    layout
                  >
                    <Card
                      className="overflow-visible p-4"
                      data-testid={`card-favorite-verse-${verse.id}`}
                    >
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() =>
                            setExpandedId(expandedId === verse.id ? null : verse.id)
                          }
                        >
                          <p className="text-xs font-medium text-primary">
                            {verse.category}
                          </p>
                          <p className="mt-1 font-serif text-base font-semibold text-foreground">
                            {verse.reference}
                          </p>
                          {expandedId !== verse.id && (
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                              {verse.decodedMessage}
                            </p>
                          )}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemove(verse.id)}
                          className="text-muted-foreground"
                          data-testid={`button-remove-favorite-${verse.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
                              <VerseCard
                                verse={verse}
                                showFullCard
                                onFavoriteChange={loadFavorites}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {activeTab === "highlights" && (
          <motion.div
            key="highlights"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {highlights.length === 0 && (
              <div className="flex flex-col items-center gap-4 px-4 py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Book className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="font-serif text-lg font-semibold text-foreground" data-testid="text-no-highlights">
                    No highlights yet
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Tap any verse in the Bible reader to highlight it
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 px-4 py-2">
              <AnimatePresence mode="popLayout">
                {highlights.map((h) => (
                  <motion.div
                    key={h.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.25 }}
                    layout
                  >
                    <Card
                      className="overflow-visible p-4 border-primary/20"
                      data-testid={`card-highlight-${h.id}`}
                    >
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-primary">
                            {h.book} {h.chapter}:{h.verse}
                          </p>
                          <p
                            className="mt-2 text-sm leading-relaxed text-foreground/90"
                            style={{ fontFamily: "'Lora', serif" }}
                          >
                            {h.text}
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveHighlight(h)}
                          className="text-muted-foreground"
                          data-testid={`button-remove-highlight-${h.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
