'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTypewriterOptions {
  speed?: number; // ms per character, default 30
}

interface UseTypewriterReturn {
  displayedText: string;
  isTyping: boolean;
  skipToEnd: () => void;
}

export function useTypewriter(
  fullText: string,
  options: UseTypewriterOptions = {},
): UseTypewriterReturn {
  const { speed = 30 } = options;
  const [charIndex, setCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Reset when text changes
  useEffect(() => {
    if (prefersReducedMotion.current) {
      setCharIndex(fullText.length);
      setIsTyping(false);
      return;
    }

    setCharIndex(1);
    setIsTyping(true);
  }, [fullText]);

  // Animate
  useEffect(() => {
    if (!isTyping || charIndex >= fullText.length) {
      setIsTyping(false);
      return;
    }

    intervalRef.current = setInterval(() => {
      setCharIndex((prev) => {
        if (prev >= fullText.length - 1) {
          setIsTyping(false);
          return fullText.length;
        }
        return prev + 1;
      });
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isTyping, fullText, speed, charIndex]);

  const skipToEnd = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCharIndex(fullText.length);
    setIsTyping(false);
  }, [fullText]);

  return {
    displayedText: fullText.slice(0, charIndex),
    isTyping,
    skipToEnd,
  };
}
