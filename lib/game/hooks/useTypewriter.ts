'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTypewriterOptions {
  speed?: number; // ms per character, default 30
}

interface UseTypewriterReturn {
  displayedText: string;
  isTyping: boolean;
  isTypingRef: React.RefObject<boolean>;
  skipToEnd: () => void;
}

export function useTypewriter(
  fullText: string,
  options: UseTypewriterOptions = {},
): UseTypewriterReturn {
  const { speed = 30 } = options;
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const isTypingRef = useRef(true);
  const indexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const textRef = useRef(fullText);

  // Reset when text changes
  useEffect(() => {
    // Check reduced motion
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setDisplayedText(fullText);
      setIsTyping(false);
      isTypingRef.current = false;
      return;
    }

    // Reset state for new text
    textRef.current = fullText;
    indexRef.current = 0;
    setDisplayedText('');
    setIsTyping(true);
    isTypingRef.current = true;

    // Clear previous interval
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Start typing
    intervalRef.current = setInterval(() => {
      indexRef.current += 1;
      const currentIndex = indexRef.current;
      const currentText = textRef.current;

      if (currentIndex >= currentText.length) {
        setDisplayedText(currentText);
        setIsTyping(false);
        isTypingRef.current = false;
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
      } else {
        setDisplayedText(currentText.slice(0, currentIndex));
      }
    }, speed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fullText, speed]);

  const skipToEnd = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setDisplayedText(textRef.current);
    setIsTyping(false);
    isTypingRef.current = false;
  }, []);

  return { displayedText, isTyping, isTypingRef, skipToEnd };
}
