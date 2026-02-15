import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Volume2, Loader2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";

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

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PodcastPage() {
  const { data: episodes, isLoading } = useQuery<Episode[]>({
    queryKey: ["/api/podcast/episodes"],
  });

  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [audioLoading, setAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    audio.addEventListener("timeupdate", () => setCurrentTime(audio.currentTime));
    audio.addEventListener("loadedmetadata", () => {
      setTotalDuration(audio.duration);
      setAudioLoading(false);
    });
    audio.addEventListener("ended", () => setIsPlaying(false));
    audio.addEventListener("waiting", () => setAudioLoading(true));
    audio.addEventListener("canplay", () => setAudioLoading(false));

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  const playEpisode = (ep: Episode) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentEpisode?.audioUrl === ep.audioUrl) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
      return;
    }

    setAudioLoading(true);
    setCurrentEpisode(ep);
    setCurrentTime(0);
    audio.src = ep.audioUrl;
    audio.play().then(() => setIsPlaying(true)).catch(() => setAudioLoading(false));
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !currentEpisode) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const seekTo = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, totalDuration));
  };

  const playNext = () => {
    if (!episodes || !currentEpisode) return;
    const idx = episodes.findIndex(e => e.audioUrl === currentEpisode.audioUrl);
    if (idx >= 0 && idx < episodes.length - 1) {
      playEpisode(episodes[idx + 1]);
    }
  };

  const playPrev = () => {
    if (!episodes || !currentEpisode) return;
    const idx = episodes.findIndex(e => e.audioUrl === currentEpisode.audioUrl);
    if (idx > 0) {
      playEpisode(episodes[idx - 1]);
    }
  };

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
      ) : (
        <div className="flex flex-col gap-3 px-4 py-2">
          {episodes?.map((ep, idx) => {
            const isCurrent = currentEpisode?.audioUrl === ep.audioUrl;
            return (
              <motion.div
                key={ep.audioUrl}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.03 }}
              >
                <Card
                  className={`p-4 cursor-pointer hover-elevate ${isCurrent ? "border-primary/50" : ""}`}
                  onClick={() => playEpisode(ep)}
                  data-testid={`card-episode-${idx}`}
                >
                  <div className="flex items-start gap-3">
                    <Button
                      size="icon"
                      variant={isCurrent && isPlaying ? "default" : "outline"}
                      className="shrink-0 mt-0.5"
                      onClick={(e) => {
                        e.stopPropagation();
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
                      <h3 className={`text-sm font-semibold leading-snug ${isCurrent ? "text-primary" : "text-foreground"}`} data-testid={`text-episode-title-${idx}`}>
                        {ep.episodeNumber ? `Ep. ${ep.episodeNumber}: ` : ""}{ep.title}
                      </h3>
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

      {currentEpisode && (
        <div className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 border-t border-border bg-background/98 backdrop-blur-lg px-4 py-3" data-testid="player-bar">
          <div className="mx-auto max-w-lg">
            <p className="text-xs font-semibold text-foreground truncate mb-2" data-testid="text-now-playing">
              {currentEpisode.title}
            </p>
            <Slider
              value={[currentTime]}
              max={totalDuration || 100}
              step={1}
              onValueChange={seekTo}
              className="mb-2"
              data-testid="slider-seek"
            />
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] text-muted-foreground w-10">{formatTime(currentTime)}</span>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" onClick={playPrev} data-testid="button-prev">
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => skip(-15)} data-testid="button-rewind">
                  <span className="text-[10px] font-semibold">-15</span>
                </Button>
                <Button size="icon" onClick={togglePlay} data-testid="button-play-pause">
                  {audioLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => skip(30)} data-testid="button-forward">
                  <span className="text-[10px] font-semibold">+30</span>
                </Button>
                <Button size="icon" variant="ghost" onClick={playNext} data-testid="button-next">
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-[10px] text-muted-foreground w-10 text-right">{formatTime(totalDuration)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
