import { createContext, useContext, useState, useRef, useEffect, useCallback, type ReactNode } from "react";

interface Episode {
  title: string;
  description: string;
  audioUrl: string;
  pubDate: string;
  duration: string;
  episodeNumber: number | null;
  link: string;
}

interface AudioContextValue {
  currentEpisode: Episode | null;
  isPlaying: boolean;
  currentTime: number;
  totalDuration: number;
  audioLoading: boolean;
  playEpisode: (ep: Episode) => void;
  togglePlay: () => void;
  seekTo: (value: number[]) => void;
  skip: (seconds: number) => void;
  playNext: () => void;
  playPrev: () => void;
  setEpisodeList: (eps: Episode[]) => void;
  isEpisodeCurrent: (audioUrl: string) => boolean;
}

const AudioCtx = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [audioLoading, setAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const episodeListRef = useRef<Episode[]>([]);

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

  const setEpisodeList = useCallback((eps: Episode[]) => {
    episodeListRef.current = eps;
  }, []);

  const playEpisode = useCallback((ep: Episode) => {
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
  }, [currentEpisode, isPlaying]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentEpisode) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  }, [currentEpisode, isPlaying]);

  const seekTo = useCallback((value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  }, []);

  const skip = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, totalDuration));
  }, [totalDuration]);

  const playNext = useCallback(() => {
    const eps = episodeListRef.current;
    if (!eps.length || !currentEpisode) return;
    const idx = eps.findIndex(e => e.audioUrl === currentEpisode.audioUrl);
    if (idx >= 0 && idx < eps.length - 1) {
      playEpisode(eps[idx + 1]);
    }
  }, [currentEpisode, playEpisode]);

  const playPrev = useCallback(() => {
    const eps = episodeListRef.current;
    if (!eps.length || !currentEpisode) return;
    const idx = eps.findIndex(e => e.audioUrl === currentEpisode.audioUrl);
    if (idx > 0) {
      playEpisode(eps[idx - 1]);
    }
  }, [currentEpisode, playEpisode]);

  const isEpisodeCurrent = useCallback((audioUrl: string) => {
    return currentEpisode?.audioUrl === audioUrl;
  }, [currentEpisode]);

  return (
    <AudioCtx.Provider value={{
      currentEpisode, isPlaying, currentTime, totalDuration, audioLoading,
      playEpisode, togglePlay, seekTo, skip, playNext, playPrev, setEpisodeList, isEpisodeCurrent,
    }}>
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error("useAudio must be used within AudioProvider");
  return ctx;
}
