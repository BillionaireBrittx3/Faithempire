import { useState, useCallback, useEffect, useRef } from "react";

export type SpeechSpeed = "slow" | "normal" | "fast";

const SPEED_MAP: Record<SpeechSpeed, number> = {
  slow: 0.75,
  normal: 1.0,
  fast: 1.35,
};

interface SpeechOptions {
  verses: { verse: number; text: string }[];
  bookName: string;
  chapter: number;
}

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeVerse, setActiveVerse] = useState<number | null>(null);
  const [speed, setSpeed] = useState<SpeechSpeed>("normal");
  const versesRef = useRef<{ verse: number; text: string }[]>([]);
  const currentIndexRef = useRef(0);
  const stoppedRef = useRef(false);
  const speedRef = useRef<SpeechSpeed>("normal");
  const speedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      if (speedTimeoutRef.current) {
        clearTimeout(speedTimeoutRef.current);
        speedTimeoutRef.current = null;
      }
    };
  }, []);

  const speakVerse = useCallback((index: number) => {
    if (stoppedRef.current) return;
    const verses = versesRef.current;
    if (index >= verses.length) {
      setIsSpeaking(false);
      setActiveVerse(null);
      currentIndexRef.current = 0;
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
  }, []);

  const startSpeaking = useCallback((options: SpeechOptions, startFromVerse?: number) => {
    if (options.verses.length === 0) return;

    stoppedRef.current = false;
    versesRef.current = options.verses;

    let startIndex = 0;
    if (startFromVerse !== undefined) {
      const idx = options.verses.findIndex((v) => v.verse === startFromVerse);
      if (idx >= 0) startIndex = idx;
    }

    setIsSpeaking(true);
    setIsPaused(false);

    const v = options.verses[startIndex];
    currentIndexRef.current = startIndex;
    setActiveVerse(v.verse);

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      speakVerse(startIndex);
    }
  }, [speakVerse]);

  const stopSpeaking = useCallback(() => {
    stoppedRef.current = true;
    window.speechSynthesis?.cancel();
    if (speedTimeoutRef.current) {
      clearTimeout(speedTimeoutRef.current);
      speedTimeoutRef.current = null;
    }
    setIsSpeaking(false);
    setIsPaused(false);
    setActiveVerse(null);
    currentIndexRef.current = 0;
  }, []);

  const togglePause = useCallback(() => {
    if (!isSpeaking) return;
    if (!window.speechSynthesis) return;
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isPaused, isSpeaking]);

  const changeSpeed = useCallback((newSpeed: SpeechSpeed) => {
    setSpeed(newSpeed);
    if (isSpeaking && !isPaused && window.speechSynthesis) {
      const currentIdx = currentIndexRef.current;
      window.speechSynthesis.cancel();
      stoppedRef.current = false;
      if (speedTimeoutRef.current) {
        clearTimeout(speedTimeoutRef.current);
      }
      speedTimeoutRef.current = setTimeout(() => {
        speedTimeoutRef.current = null;
        if (!stoppedRef.current) {
          speakVerse(currentIdx);
        }
      }, 50);
    }
  }, [isSpeaking, isPaused, speakVerse]);

  return {
    isSpeaking,
    isPaused,
    activeVerse,
    speed,
    startSpeaking,
    stopSpeaking,
    togglePause,
    changeSpeed,
    supported,
  };
}
