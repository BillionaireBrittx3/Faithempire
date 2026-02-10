import { useState, useEffect, useRef, useCallback } from "react";
import { Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { isFavorite, toggleFavorite } from "@/lib/favorites";
import type { Verse } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

interface VerseCardProps {
  verse: Verse;
  displayDate?: string;
  showFullCard?: boolean;
  onFavoriteChange?: () => void;
}

export function VerseCard({ verse, displayDate, showFullCard = true, onFavoriteChange }: VerseCardProps) {
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();
  const shareImageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSaved(isFavorite(verse.id));
  }, [verse.id]);

  const handleToggleFavorite = useCallback(() => {
    const nowSaved = toggleFavorite(verse);
    setSaved(nowSaved);
    toast({
      title: nowSaved ? "Verse Saved" : "Verse Removed",
      description: nowSaved
        ? "Added to your saved verses"
        : "Removed from your saved verses",
    });
    onFavoriteChange?.();
  }, [verse, toast, onFavoriteChange]);

  const handleShare = useCallback(async () => {
    const shareText = `"${verse.verseText}"\n\n— ${verse.reference}\n\nDECODED:\n${verse.decodedMessage}\n\ndecodedfaithempire.org`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Faith Empire - ${verse.reference}`,
          text: shareText,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          await navigator.clipboard.writeText(shareText);
          toast({ title: "Copied to clipboard", description: "Share this verse with someone who needs it today" });
        }
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast({ title: "Copied to clipboard", description: "Share this verse with someone who needs it today" });
    }
  }, [verse, toast]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full"
    >
      <div className="flex flex-col items-center px-4 py-6 text-center" data-testid={`verse-card-${verse.id}`}>
        {displayDate && (
          <p className="mb-6 text-xs font-medium uppercase tracking-[0.3em] text-primary" data-testid="text-verse-date">
            {displayDate}
          </p>
        )}

        <div className="mx-auto mb-8 h-px w-16 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <blockquote className="mx-auto max-w-md px-2">
          <p
            className="font-serif text-xl font-normal italic leading-relaxed text-foreground md:text-2xl"
            style={{ fontFamily: "'Lora', serif" }}
            data-testid="text-verse-text"
          >
            "{verse.verseText}"
          </p>
        </blockquote>

        <p
          className="mt-5 text-sm font-semibold tracking-widest text-primary"
          data-testid="text-verse-reference"
        >
          — {verse.reference} —
        </p>

        {showFullCard && (
          <>
            <div className="mx-auto my-8 flex w-full max-w-xs items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/30" />
              <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary">
                Decoded
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/30" />
            </div>

            <p
              className="mx-auto max-w-md px-2 text-sm leading-relaxed text-muted-foreground md:text-base"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
              data-testid="text-decoded-message"
            >
              {verse.decodedMessage}
            </p>

            <div className="mt-8 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={handleToggleFavorite}
                className={`gap-2 border-primary/30 ${saved ? "text-red-500" : "text-foreground"}`}
                data-testid="button-favorite"
              >
                <Heart className={`h-4 w-4 ${saved ? "fill-red-500" : ""}`} />
                {saved ? "Saved" : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={handleShare}
                className="gap-2 border-primary/30"
                data-testid="button-share"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
