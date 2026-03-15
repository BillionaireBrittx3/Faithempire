import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Square, Volume2, Repeat, ChevronDown } from "lucide-react";
import { type SpeechSpeed } from "@/lib/use-speech";
import { motion } from "framer-motion";
import { useState } from "react";

const SPEED_OPTIONS: { value: SpeechSpeed; label: string }[] = [
  { value: "slow", label: "0.75x" },
  { value: "normal", label: "1x" },
  { value: "fast", label: "1.35x" },
];

interface SpeechControlsProps {
  isSpeaking: boolean;
  isPaused: boolean;
  speed: SpeechSpeed;
  voices: SpeechSynthesisVoice[];
  selectedVoiceURI: string;
  continuousPlay: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSpeedChange: (speed: SpeechSpeed) => void;
  onVoiceChange: (voiceURI: string) => void;
  onContinuousToggle: () => void;
  mode?: "kjv" | "decoded";
  onModeChange?: (mode: "kjv" | "decoded") => void;
  showModeToggle?: boolean;
  totalChapters?: number;
  currentChapter?: number;
}

export function SpeechControls({
  isSpeaking,
  isPaused,
  speed,
  voices,
  selectedVoiceURI,
  continuousPlay,
  onPlay,
  onPause,
  onStop,
  onSpeedChange,
  onVoiceChange,
  onContinuousToggle,
  mode,
  onModeChange,
  showModeToggle = false,
  totalChapters,
  currentChapter,
}: SpeechControlsProps) {
  const [showVoices, setShowVoices] = useState(false);

  const selectedVoiceName = voices.find((v) => v.voiceURI === selectedVoiceURI)?.name || "Default";

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="overflow-hidden"
    >
      <div className="mx-4 mb-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Volume2 className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Listen Along</span>
        </div>

        {showModeToggle && onModeChange && (
          <div className="flex gap-1.5 mb-2" role="radiogroup" aria-label="Listen mode">
            <Badge
              role="radio"
              tabIndex={0}
              aria-checked={mode === "decoded"}
              variant={mode === "decoded" ? "default" : "outline"}
              className={`cursor-pointer text-[10px] ${
                mode === "decoded"
                  ? "bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground"
              }`}
              onClick={() => onModeChange("decoded")}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onModeChange("decoded"); } }}
              data-testid="badge-listen-decoded"
            >
              Decoded
            </Badge>
            <Badge
              role="radio"
              tabIndex={0}
              aria-checked={mode === "kjv"}
              variant={mode === "kjv" ? "default" : "outline"}
              className={`cursor-pointer text-[10px] ${
                mode === "kjv"
                  ? "bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground"
              }`}
              onClick={() => onModeChange("kjv")}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onModeChange("kjv"); } }}
              data-testid="badge-listen-kjv"
            >
              Original KJV
            </Badge>
          </div>
        )}

        <div className="flex items-center gap-2">
          {!isSpeaking ? (
            <Button
              size="sm"
              onClick={onPlay}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="button-speech-play"
            >
              <Play className="h-3.5 w-3.5 mr-1" />
              Play
            </Button>
          ) : (
            <>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={onPause}
                aria-label={isPaused ? "Resume" : "Pause"}
                data-testid="button-speech-pause"
              >
                {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={onStop}
                aria-label="Stop"
                data-testid="button-speech-stop"
              >
                <Square className="h-3 w-3" />
              </Button>
            </>
          )}

          <Button
            size="sm"
            variant={continuousPlay ? "default" : "outline"}
            className={`h-8 text-[10px] px-2 ${
              continuousPlay ? "bg-primary text-primary-foreground" : ""
            }`}
            onClick={onContinuousToggle}
            aria-label="Continuous play"
            data-testid="button-continuous-play"
          >
            <Repeat className="h-3 w-3 mr-0.5" />
            Auto
          </Button>

          <div className="flex items-center gap-1 ml-auto" role="radiogroup" aria-label="Playback speed">
            <span className="text-[10px] text-muted-foreground mr-1">Speed:</span>
            {SPEED_OPTIONS.map((opt) => (
              <Badge
                key={opt.value}
                role="radio"
                tabIndex={0}
                aria-checked={speed === opt.value}
                variant={speed === opt.value ? "default" : "outline"}
                className={`cursor-pointer text-[10px] px-1.5 py-0 ${
                  speed === opt.value
                    ? "bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground"
                }`}
                onClick={() => onSpeedChange(opt.value)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSpeedChange(opt.value); } }}
                data-testid={`badge-speed-${opt.value}`}
              >
                {opt.label}
              </Badge>
            ))}
          </div>
        </div>

        {voices.length > 0 && (
          <div className="mt-2">
            <button
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowVoices(!showVoices)}
              data-testid="button-voice-toggle"
            >
              <span>Voice: {selectedVoiceURI ? selectedVoiceName : "Default"}</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${showVoices ? "rotate-180" : ""}`} />
            </button>
            {showVoices && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="overflow-hidden mt-1"
              >
                <div className="max-h-32 overflow-y-auto rounded-md border border-border bg-background p-1">
                  <button
                    className={`w-full text-left text-[10px] px-2 py-1.5 rounded hover:bg-primary/10 transition-colors ${
                      !selectedVoiceURI ? "text-primary font-medium" : "text-muted-foreground"
                    }`}
                    onClick={() => { onVoiceChange(""); setShowVoices(false); }}
                    data-testid="button-voice-default"
                  >
                    Default
                  </button>
                  {voices.map((voice) => (
                    <button
                      key={voice.voiceURI}
                      className={`w-full text-left text-[10px] px-2 py-1.5 rounded hover:bg-primary/10 transition-colors ${
                        selectedVoiceURI === voice.voiceURI ? "text-primary font-medium" : "text-muted-foreground"
                      }`}
                      onClick={() => { onVoiceChange(voice.voiceURI); setShowVoices(false); }}
                      data-testid={`button-voice-${voice.voiceURI.replace(/\s/g, "-").toLowerCase()}`}
                    >
                      {voice.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {isSpeaking && (
          <p className="mt-2 text-[10px] text-muted-foreground/70">
            {isPaused ? "Paused" : continuousPlay
              ? `Reading aloud — will continue to next chapter automatically${totalChapters && currentChapter ? ` (${currentChapter}/${totalChapters})` : ""}`
              : "Reading aloud — current verse is highlighted"
            }
          </p>
        )}

        {!isSpeaking && continuousPlay && (
          <p className="mt-2 text-[10px] text-primary/70">
            Continuous play on — will read through all chapters
          </p>
        )}
      </div>
    </motion.div>
  );
}
