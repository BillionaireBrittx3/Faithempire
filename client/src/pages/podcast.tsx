import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, Loader2 } from "lucide-react";
import { useSubscription, FREE_PODCAST_EPISODES } from "@/lib/subscription";
import { PremiumBadge } from "@/components/premium-lock";
import { useLocation } from "wouter";
import { useAudio } from "@/lib/audio-context";

interface Episode {
  title: string;
  description: string;
  audioUrl: string;
  pubDate: string;
  duration: string;
  episodeNumber: number | null;
  link: string;
}

function formatDuration(dur: string): string {
  if (!dur) return "";
  const parts = dur.split(":").map(Number);
  if (parts.length === 3) {
    const [h, m, s] = parts;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${s}s`;
  }
  if (parts.length === 2) {
    return `${parts[0]}m ${parts[1]}s`;
  }
  const totalSec = parseInt(dur);
  if (!isNaN(totalSec)) {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}m ${s}s`;
  }
  return dur;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export default function PodcastPage() {
  const { data: episodes, isLoading, error } = useQuery<Episode[]>({
    queryKey: ["/api/podcast/episodes"],
  });
  const { isPremium } = useSubscription();
  const [, navigate] = useLocation();
  const { playEpisode, isPlaying, audioLoading, isEpisodeCurrent, setEpisodeList } = useAudio();

  const isEpisodeLocked = (idx: number) => !isPremium && idx >= FREE_PODCAST_EPISODES;

  useEffect(() => {
    if (episodes) {
      setEpisodeList(episodes);
    }
  }, [episodes, setEpisodeList]);

  return (
    <div className="pb-20">
      <div className="px-4 pt-5 pb-3">
        <h1 className="font-serif text-2xl font-bold text-foreground" data-testid="text-podcast-title">
          Podcast
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Decoded Faith Empire</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-4 px-4 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Volume2 className="h-7 w-7 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground" data-testid="text-podcast-error">
            Unable to load podcast episodes. Please try again later.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 px-4 py-2">
          {episodes?.map((ep, idx) => {
            const isCurrent = isEpisodeCurrent(ep.audioUrl);
            const locked = isEpisodeLocked(idx);
            return (
              <motion.div
                key={ep.audioUrl}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.03 }}
              >
                <Card
                  className={`p-4 ${locked ? "opacity-60 cursor-pointer" : "cursor-pointer hover-elevate"} ${isCurrent ? "border-primary/50" : ""}`}
                  onClick={() => locked ? navigate("/premium") : playEpisode(ep)}
                  data-testid={`card-episode-${idx}`}
                >
                  <div className="flex items-start gap-3">
                    <Button
                      size="icon"
                      variant={isCurrent && isPlaying ? "default" : "outline"}
                      className="shrink-0 mt-0.5"
                      disabled={locked}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (locked) { navigate("/premium"); return; }
                        playEpisode(ep);
                      }}
                      data-testid={`button-play-episode-${idx}`}
                    >
                      {isCurrent && audioLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isCurrent && isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-sm font-semibold leading-snug ${isCurrent ? "text-primary" : "text-foreground"}`} data-testid={`text-episode-title-${idx}`}>
                          {ep.episodeNumber ? `Ep. ${ep.episodeNumber}: ` : ""}{ep.title}
                        </h3>
                        {locked && <PremiumBadge />}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] text-muted-foreground">{formatDate(ep.pubDate)}</span>
                        {ep.duration && (
                          <>
                            <span className="text-[10px] text-muted-foreground/40">|</span>
                            <span className="text-[10px] text-muted-foreground">{formatDuration(ep.duration)}</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                        {ep.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}

          {episodes && episodes.length === 0 && (
            <div className="py-16 text-center">
              <Volume2 className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No episodes available yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
