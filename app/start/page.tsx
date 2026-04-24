'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import FunnelStepper from '@/components/funnel/FunnelStepper';
import { LESSONS } from '@/lib/funnel/lessons';
import { copy } from '@/lib/funnel/copy';
import { postFunnelEvent, readIdentity } from '@/lib/funnel/progress-client';

// Lazy — PhoneInput pulls country data and the whole form is only needed after Play click.
const RegistrationGateModal = dynamic(
  () => import('@/components/funnel/RegistrationGateModal'),
  { ssr: false },
);

export default function StartPage() {
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    postFunnelEvent('landing_view');
    const id = readIdentity();
    if (id) {
      fetch('/api/funnel/state', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ lead_id: id.leadId, token: id.token }),
      })
        .then(async (res) => (res.ok ? res.json() : null))
        .then((state: null | { current_lesson: number }) => {
          if (state) {
            window.location.replace(`/start/dars/${state.current_lesson}`);
          }
        })
        .catch(() => {
          /* stay on landing */
        });
    }
  }, []);

  const firstVideoId = LESSONS[0].youtubeId;

  const handlePlay = () => {
    postFunnelEvent('play_clicked');
    setModalOpen(true);
  };

  return (
    <>
      <main className="flex flex-col items-center gap-8 pb-16 px-5">
        <FunnelStepper currentLesson={1} completedLessons={[]} />

        <div className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden bg-black/80 shadow-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${firstVideoId}/hqdefault.jpg`}
            srcSet={[
              `https://i.ytimg.com/vi/${firstVideoId}/hqdefault.jpg 480w`,
              `https://i.ytimg.com/vi/${firstVideoId}/sddefault.jpg 640w`,
              `https://i.ytimg.com/vi/${firstVideoId}/maxresdefault.jpg 1280w`,
            ].join(', ')}
            sizes="(max-width: 768px) 100vw, 960px"
            width={1280}
            height={720}
            alt="Dars 1 preview"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={handlePlay}
            className="absolute inset-0 flex items-center justify-center group"
            aria-label={copy.landing.playHint}
          >
            <span className="size-20 md:size-24 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center transition shadow-2xl">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="w-9 h-9 md:w-10 md:h-10 text-[color:var(--color-primary)] fill-current ml-1"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        </div>
      </main>
      <RegistrationGateModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
