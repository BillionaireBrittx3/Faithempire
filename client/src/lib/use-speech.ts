import { useState, useCallback, useEffect, useRef } from "react";

export type SpeechSpeed = "slow" | "normal" | "fast";

const SPEED_MAP: Record<SpeechSpeed, number> = {
  slow: 0.75,
  normal: 1.0,
  fast: 1.35,
};

const VOICE_STORAGE_KEY = "faith_empire_speech_voice";
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
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>(() => {
    try { return localStorage.getItem(VOICE_STORAGE_KEY) || ""; } catch { return ""; }
  });
  const [continuousPlay, setContinuousPlay] = useState<boolean>(() => {
    try { return localStorage.getItem(CONTINUOUS_STORAGE_KEY) === "true"; } catch { return false; }
  });

  const versesRef = useRef<{ verse: number; text: string }[]>([]);
  const currentIndexRef = useRef(0);
  const stoppedRef = useRef(false);
  const speedRef = useRef<SpeechSpeed>("normal");
  const speedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedVoiceURIRef = useRef(selectedVoiceURI);
  const onChapterCompleteRef = useRef(onChapterComplete);
  const continuousPlayRef = useRef(continuousPlay);

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
    selectedVoiceURIRef.current = selectedVoiceURI;
  }, [selectedVoiceURI]);

  useEffect(() => {
    if (!window.speechSynthesis) return;

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      const english = available.filter((v) => v.lang.startsWith("en"));
      setVoices(english.length > 0 ? english : available);
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      if (speedTimeoutRef.current) {
        clearTimeout(speedTimeoutRef.current);
        speedTimeoutRef.current = null;
      }
    };
  }, []);

  const getSelectedVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (!selectedVoiceURIRef.current) return null;
    const available = window.speechSynthesis?.getVoices() || [];
    return available.find((v) => v.voiceURI === selectedVoiceURIRef.current) || null;
  }, []);

  const speakVerse = useCallback((index: number) => {
    if (stoppedRef.current) return;
    const verses = versesRef.current;
    if (index >= verses.length) {
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

    const voice = getSelectedVoice();
    if (voice) {
      utterance.voice = voice;
    }

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
  }, [getSelectedVoice]);

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

  const changeVoice = useCallback((voiceURI: string) => {
    setSelectedVoiceURI(voiceURI);
    try { localStorage.setItem(VOICE_STORAGE_KEY, voiceURI); } catch {}
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
    voices,
    selectedVoiceURI,
    continuousPlay,
    startSpeaking,
    stopSpeaking,
    togglePause,
    changeSpeed,
    changeVoice,
    toggleContinuousPlay,
    supported,
  };
}
