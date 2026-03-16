import { useState, useCallback, useEffect, useRef } from "react";

export type SpeechSpeed = "slow" | "normal" | "fast";

const SPEED_MAP: Record<SpeechSpeed, number> = {
  slow: 0.75,
  normal: 1.0,
  fast: 1.35,
};

const CONTINUOUS_STORAGE_KEY = "faith_empire_continuous_play";

interface SpeechOptions {
  verses: { verse: number; text: string }[];
  bookName: string;
  chapter: number;
}

export function useSpeech(onChapterComplete?: () => void) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeVerse, setActiveVerse] = useState<number | null>(null);
  const [speed, setSpeed] = useState<SpeechSpeed>("normal");
  const [continuousPlay, setContinuousPlay] = useState<boolean>(() => {
    try { return localStorage.getItem(CONTINUOUS_STORAGE_KEY) === "true"; } catch { return false; }
  });

  const versesRef = useRef<{ verse: number; text: string }[]>([]);
  const currentIndexRef = useRef(0);
  const stoppedRef = useRef(false);
  const speedRef = useRef<SpeechSpeed>("normal");
  const speedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onChapterCompleteRef = useRef(onChapterComplete);
  const continuousPlayRef = useRef(continuousPlay);
  const watchdogRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRef = useRef(false);
  const hasSpokeRef = useRef(false);
  const speakStartTimeRef = useRef(0);
  const wakeLockRef = useRef<any>(null);

  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    onChapterCompleteRef.current = onChapterComplete;
  }, [onChapterComplete]);

  useEffect(() => {
    continuousPlayRef.current = continuousPlay;
  }, [continuousPlay]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !stoppedRef.current && !pausedRef.current && !wakeLockRef.current) {
        acquireWakeLock();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.speechSynthesis?.cancel();
      clearWatchdog();
      releaseWakeLock();
      if (speedTimeoutRef.current) {
        clearTimeout(speedTimeoutRef.current);
        speedTimeoutRef.current = null;
      }
    };
  }, []);

  const acquireWakeLock = useCallback(async () => {
    try {
      if ("wakeLock" in navigator && !wakeLockRef.current) {
        wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
        wakeLockRef.current.addEventListener("release", () => {
          wakeLockRef.current = null;
        });
      }
    } catch {}
  }, []);

  const releaseWakeLock = useCallback(() => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }
  }, []);

  const clearWatchdog = useCallback(() => {
    if (watchdogRef.current) {
      clearInterval(watchdogRef.current);
      watchdogRef.current = null;
    }
  }, []);

  const startWatchdog = useCallback(() => {
    clearWatchdog();
    watchdogRef.current = setInterval(() => {
      if (!window.speechSynthesis) return;
      if (stoppedRef.current || pausedRef.current) return;

      if (window.speechSynthesis.speaking) {
        hasSpokeRef.current = true;
      }

      const elapsed = Date.now() - speakStartTimeRef.current;
      if (elapsed < 2000) return;

      if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending && hasSpokeRef.current) {
        clearWatchdog();
        const verses = versesRef.current;
        const nextIdx = currentIndexRef.current + 1;
        if (nextIdx >= verses.length) {
          releaseWakeLock();
          if (continuousPlayRef.current && onChapterCompleteRef.current) {
            onChapterCompleteRef.current();
          } else {
            setIsSpeaking(false);
            setActiveVerse(null);
            currentIndexRef.current = 0;
          }
        } else {
          speakVerse(nextIdx);
        }
      }

      if (window.speechSynthesis.paused && !pausedRef.current) {
        window.speechSynthesis.resume();
      }
    }, 500);
  }, [clearWatchdog]);

  const speakVerse = useCallback((index: number) => {
    if (stoppedRef.current) return;
    const verses = versesRef.current;
    if (index >= verses.length) {
      clearWatchdog();
      releaseWakeLock();
      if (continuousPlayRef.current && onChapterCompleteRef.current) {
        onChapterCompleteRef.current();
      } else {
        setIsSpeaking(false);
        setActiveVerse(null);
        currentIndexRef.current = 0;
      }
      return;
    }

    const v = verses[index];
    currentIndexRef.current = index;
    setActiveVerse(v.verse);

    const utterance = new SpeechSynthesisUtterance(v.text);
    utterance.rate = SPEED_MAP[speedRef.current];
    utterance.pitch = 1.0;
    utterance.lang = "en-US";

    utterance.onend = () => {
      if (!stoppedRef.current) {
        speakVerse(index + 1);
      }
    };

    utterance.onerror = (e) => {
      if (e.error !== "canceled" && !stoppedRef.current) {
        speakVerse(index + 1);
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [clearWatchdog]);

  const startSpeaking = useCallback((options: SpeechOptions, startFromVerse?: number) => {
    if (options.verses.length === 0) return;

    stoppedRef.current = false;
    pausedRef.current = false;
    versesRef.current = options.verses;

    let startIndex = 0;
    if (startFromVerse !== undefined) {
      const idx = options.verses.findIndex((v) => v.verse === startFromVerse);
      if (idx >= 0) startIndex = idx;
    }

    setIsSpeaking(true);
    setIsPaused(false);
    hasSpokeRef.current = false;
    speakStartTimeRef.current = Date.now();
    acquireWakeLock();

    const v = options.verses[startIndex];
    currentIndexRef.current = startIndex;
    setActiveVerse(v.verse);

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      speakVerse(startIndex);
      startWatchdog();
    }
  }, [speakVerse, startWatchdog, acquireWakeLock]);

  const stopSpeaking = useCallback(() => {
    stoppedRef.current = true;
    pausedRef.current = false;
    window.speechSynthesis?.cancel();
    clearWatchdog();
    releaseWakeLock();
    if (speedTimeoutRef.current) {
      clearTimeout(speedTimeoutRef.current);
      speedTimeoutRef.current = null;
    }
    setIsSpeaking(false);
    setIsPaused(false);
    setActiveVerse(null);
    currentIndexRef.current = 0;
  }, [clearWatchdog, releaseWakeLock]);

  const togglePause = useCallback(() => {
    if (!isSpeaking) return;
    if (!window.speechSynthesis) return;
    if (isPaused) {
      pausedRef.current = false;
      window.speechSynthesis.resume();
      setIsPaused(false);
      startWatchdog();
      acquireWakeLock();
    } else {
      pausedRef.current = true;
      window.speechSynthesis.pause();
      setIsPaused(true);
      clearWatchdog();
      releaseWakeLock();
    }
  }, [isPaused, isSpeaking, startWatchdog, clearWatchdog, acquireWakeLock, releaseWakeLock]);

  const changeSpeed = useCallback((newSpeed: SpeechSpeed) => {
    setSpeed(newSpeed);
    if (isSpeaking && !isPaused && window.speechSynthesis) {
      const currentIdx = currentIndexRef.current;
      window.speechSynthesis.cancel();
      clearWatchdog();
      stoppedRef.current = false;
      if (speedTimeoutRef.current) {
        clearTimeout(speedTimeoutRef.current);
      }
      speedTimeoutRef.current = setTimeout(() => {
        speedTimeoutRef.current = null;
        if (!stoppedRef.current) {
          speakVerse(currentIdx);
          startWatchdog();
        }
      }, 50);
    }
  }, [isSpeaking, isPaused, speakVerse, clearWatchdog, startWatchdog]);

  const toggleContinuousPlay = useCallback(() => {
    setContinuousPlay((prev) => {
      const next = !prev;
      try { localStorage.setItem(CONTINUOUS_STORAGE_KEY, String(next)); } catch {}
      return next;
    });
  }, []);

  return {
    isSpeaking,
    isPaused,
    activeVerse,
    speed,
    continuousPlay,
    startSpeaking,
    stopSpeaking,
    togglePause,
    changeSpeed,
    toggleContinuousPlay,
    supported,
  };
}
