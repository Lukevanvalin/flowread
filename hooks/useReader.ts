'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

export function useReader(wpm: number) {
  const [words, setWords] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalWords = words.length;
  const currentWord = words[index] ?? '';
  const progress = totalWords > 0 ? ((index + 1) / totalWords) * 100 : 0;
  const wordsRemaining = Math.max(0, totalWords - index - 1);
  const estimatedSeconds = wpm > 0 ? Math.round((wordsRemaining / wpm) * 60) : 0;

  const contextBefore = words.slice(Math.max(0, index - 3), index);
  const contextAfter = words.slice(index + 1, index + 4);

  const loadText = useCallback((text: string) => {
    const parsed = text.split(/\s+/).filter(w => w.length > 0);
    setWords(parsed);
    setIndex(0);
    setIsPlaying(false);
  }, []);

  const clearReader = useCallback(() => {
    setWords([]);
    setIndex(0);
    setIsPlaying(false);
  }, []);

  const pause = useCallback(() => setIsPlaying(false), []);
  const play = useCallback(() => {
    if (words.length > 0 && index < words.length - 1) setIsPlaying(true);
  }, [words.length, index]);

  const toggle = useCallback(() => {
    setIsPlaying(prev => {
      if (prev) return false;
      if (words.length > 0 && index < words.length - 1) return true;
      return false;
    });
  }, [words.length, index]);

  const stepForward = useCallback(() => {
    setIsPlaying(false);
    setIndex(prev => Math.min(prev + 1, words.length - 1));
  }, [words.length]);

  const stepBack = useCallback(() => {
    setIsPlaying(false);
    setIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const jumpForward = useCallback(() => {
    setIsPlaying(false);
    setIndex(prev => Math.min(prev + 10, words.length - 1));
  }, [words.length]);

  const jumpBack = useCallback(() => {
    setIsPlaying(false);
    setIndex(prev => Math.max(prev - 10, 0));
  }, []);

  const restart = useCallback(() => {
    setIndex(0);
    setIsPlaying(false);
  }, []);

  // Playback interval
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isPlaying && words.length > 0) {
      const ms = 60000 / wpm;
      intervalRef.current = setInterval(() => {
        setIndex(prev => {
          if (prev >= words.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, ms);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, wpm, words.length]);

  return {
    words,
    currentWord,
    index,
    totalWords,
    progress,
    wordsRemaining,
    estimatedSeconds,
    contextBefore,
    contextAfter,
    isPlaying,
    loadText,
    clearReader,
    play,
    pause,
    toggle,
    stepForward,
    stepBack,
    jumpForward,
    jumpBack,
    restart,
  };
}
