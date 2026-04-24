'use client';

import { useEffect, useRef, useState } from 'react';
import FunnelCtaButton from './FunnelCtaButton';
import FadeUp from '@/components/FadeUp';
import { copy } from '@/lib/funnel/copy';
import { WATCH_THRESHOLD } from '@/lib/funnel/lessons';

declare global {
  interface Window {
    YT?: {
      Player: new (id: string, opts: unknown) => unknown;
      PlayerState: { ENDED: number; PLAYING: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ytApiLoaded = false;
function loadYouTubeApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (ytApiLoaded) {
    return new Promise<void>((resolve) => {
      const t = setInterval(() => {
        if (window.YT?.Player) {
          clearInterval(t);
          resolve();
        }
      }, 50);
    });
  }
  ytApiLoaded = true;
  return new Promise<void>((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prev) prev();
      resolve();
    };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.async = true;
    document.head.appendChild(s);
  });
}

export default function YouTubeLesson({
  videoId,
  preCompleted,
  onReadyToProceed,
  onProceedClick,
}: {
  videoId: string;
  preCompleted: boolean;
  onReadyToProceed?: () => void;
  onProceedClick: () => void;
}) {
  const containerId = useRef(`yt-${Math.random().toString(36).slice(2)}`);
  const playerRef = useRef<{
    getCurrentTime: () => number;
    getDuration: () => number;
    destroy?: () => void;
  } | null>(null);
  const [canProceed, setCanProceed] = useState(preCompleted);

  useEffect(() => {
    if (preCompleted) setCanProceed(true);
  }, [preCompleted]);

  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    loadYouTubeApi().then(() => {
      if (cancelled) return;
      // @ts-expect-error — YT typings are provided as a minimal declare global
      playerRef.current = new window.YT.Player(containerId.current, {
        videoId,
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onStateChange: (e: { data: number }) => {
            if (e.data === window.YT?.PlayerState.ENDED) {
              setCanProceed(true);
              onReadyToProceed?.();
            }
          },
        },
      });
      interval = setInterval(() => {
        const p = playerRef.current;
        if (!p) return;
        try {
          const d = p.getDuration();
          const t = p.getCurrentTime();
          if (d > 0 && t / d >= WATCH_THRESHOLD) {
            setCanProceed(true);
            onReadyToProceed?.();
          }
        } catch {
          /* player not ready yet */
        }
      }, 500);
    });

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      try {
        playerRef.current?.destroy?.();
      } catch {
        /* noop */
      }
    };
  }, [videoId, onReadyToProceed]);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden bg-black/80 shadow-xl">
        <div id={containerId.current} className="w-full h-full" />
      </div>
      {canProceed && (
        <FadeUp>
          <FunnelCtaButton text={copy.lesson.nextCta} onClick={onProceedClick} />
        </FadeUp>
      )}
    </div>
  );
}
