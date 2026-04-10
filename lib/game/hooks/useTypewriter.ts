'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTypewriterOptions {
  speed?: number; // ms per character, default 30
}

interface UseTypewriterReturn {
  /** Ref to attach to the text element (e.g. a <span>). textContent is
      mutated imperatively — the element re-renders only twice per sentence. */
  textRef: React.RefObject<HTMLElement | null>;
  /** True while typing. Fires setState only at start and end. */
  isTyping: boolean;
  /** Synchronous ref for event handlers. */
  isTypingRef: React.RefObject<boolean>;
  /** Finish typing immediately. */
  skipToEnd: () => void;
}

/**
 * Typewriter effect that writes characters imperatively via ref.
 *
 * Previously this hook called `setDisplayedText(...)` on every interval
 * tick — ~30 React re-renders per second per dialogue line, cascading
 * through memoized parents. On mobile this saturates the JS thread
 * during normal dialogue.
 *
 * The new implementation mutates `textRef.current.textContent` directly,
 * and React state only flips twice per sentence (isTyping true → false).
 * Consumers attach `ref={textRef}` to their text element instead of
 * reading `displayedText`.
 */
export function useTypewriter(
  fullText: string,
  options: UseTypewriterOptions = {},
): UseTypewriterReturn {
  const { speed = 30 } = options;
  const [isTyping, setIsTyping] = useState(true);
  const isTypingRef = useRef(true);
  const indexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const textRef = useRef<HTMLElement | null>(null);
  const fullTextRef = useRef(fullText);

  // Helper: write current slice to the DOM without touching React state.
  const writeSlice = useCallback((text: string) => {
    if (textRef.current) {
      textRef.current.textContent = text;
    }
  }, []);

  // Reset when text changes
  useEffect(() => {
    fullTextRef.current = fullText;
    indexRef.current = 0;
    writeSlice('');
    setIsTyping(true);
    isTypingRef.current = true;

    // Clear previous interval
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Start typing
    intervalRef.current = setInterval(() => {
      indexRef.current += 1;
      const currentIndex = indexRef.current;
      const currentText = fullTextRef.current;

      if (currentIndex >= currentText.length) {
        writeSlice(currentText);
        setIsTyping(false);
        isTypingRef.current = false;
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
      } else {
        // Imperative DOM update — no React render per character.
        writeSlice(currentText.slice(0, currentIndex));
      }
    }, speed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fullText, speed, writeSlice]);

  const skipToEnd = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    writeSlice(fullTextRef.current);
    setIsTyping(false);
    isTypingRef.current = false;
  }, [writeSlice]);

  return { textRef, isTyping, isTypingRef, skipToEnd };
}
