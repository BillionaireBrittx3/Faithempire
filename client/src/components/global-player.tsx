import { useAudio } from "@/lib/audio-context";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Loader2, X } from "lucide-react";

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function GlobalPlayer() {
  const {
    currentEpisode, isPlaying, currentTime, totalDuration, audioLoading,
    togglePlay, seekTo, skip, playNext, playPrev,
  } = useAudio();

  if (!currentEpisode) return null;

  return (
    <div
      className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 border-t border-border bg-background/98 backdrop-blur-lg px-4 py-3"
      data-testid="player-bar"
    >
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
  );
}
