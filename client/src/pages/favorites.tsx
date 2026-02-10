import { useState, useEffect, useCallback } from "react";
import { Heart, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VerseCard } from "@/components/verse-card";
import { getFavorites, removeFavorite } from "@/lib/favorites";
import type { Verse } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Verse[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { toast } = useToast();

  const loadFavorites = useCallback(() => {
    setFavorites(getFavorites());
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleRemove = useCallback((verseId: number) => {
    removeFavorite(verseId);
    setFavorites((prev) => prev.filter((v) => v.id !== verseId));
    toast({ title: "Verse Removed", description: "Removed from your saved verses" });
  }, [toast]);

  return (
    <div className="pb-20">
      <div className="px-4 pt-5 pb-3">
        <h1 className="font-serif text-2xl font-bold text-foreground" data-testid="text-favorites-title">
          Saved Verses
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your personal collection of inspiring verses
        </p>
      </div>

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
          {favorites.map((verse, index) => (
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
    </div>
  );
}
