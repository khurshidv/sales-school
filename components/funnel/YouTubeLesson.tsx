'use client';

import { useEffect, useRef, useState } from 'react';
import FunnelCtaButton from './FunnelCtaButton';
import FadeUp from '@/components/FadeUp';
import { copy } from '@/lib/funnel/copy';
import { WATCH_THRESHOLD } from '@/lib/funnel/lessons';

interface YTPlayer {
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy?: () => void;
}

interface YTGlobal {
  Player: new (
    target: HTMLIFrameElement | string,
    opts: { events?: { onStateChange?: (e: { data: number }) => void } },
  ) => YTPlayer;
  PlayerState: { ENDED: number; PLAYING: number };
}

declare global {
  interface Window {
    YT?: YTGlobal;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ytApiPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise<void>((resolve) => {
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
  return ytApiPromise;
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const [canProceed, setCanProceed] = useState(preCompleted);

  useEffect(() => {
    if (preCompleted) setCanProceed(true);
  }, [preCompleted]);

  useEffect(() => {
    if (preCompleted) return;
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    loadYouTubeApi().then(() => {
      if (cancelled || !iframeRef.current || !window.YT) return;
      playerRef.current = new window.YT.Player(iframeRef.current, {
        events: {
          onStateChange: (e) => {
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
      }, 1000);
    });

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      try {
        playerRef.current?.destroy?.();
      } catch {
        /* noop */
      }
      playerRef.current = null;
    };
  }, [videoId, preCompleted, onReadyToProceed]);

  const origin =
    typeof window !== 'undefined' ? `&origin=${encodeURIComponent(window.location.origin)}` : '';
  const src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&modestbranding=1&rel=0&playsinline=1${origin}`;

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden bg-black shadow-xl">
        <iframe
          key={videoId}
          ref={iframeRef}
          src={src}
          title="Sales Up — dars"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
      {canProceed ? (
        <FadeUp>
          <FunnelCtaButton text={copy.lesson.nextCta} onClick={onProceedClick} />
        </FadeUp>
      ) : (
        <p className="text-sm md:text-base text-center text-[color:var(--color-on-surface-variant)] max-w-xl px-4">
          {copy.lesson.watchHint}
        </p>
      )}
    </div>
  );
}
