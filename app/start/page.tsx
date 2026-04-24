'use client';

import { useEffect, useState } from 'react';
import FunnelStepper from '@/components/funnel/FunnelStepper';
import RegistrationGateModal from '@/components/funnel/RegistrationGateModal';
import { LESSONS } from '@/lib/funnel/lessons';
import { copy } from '@/lib/funnel/copy';
import { postFunnelEvent, readIdentity } from '@/lib/funnel/progress-client';

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
            src={`https://img.youtube.com/vi/${firstVideoId}/maxresdefault.jpg`}
            alt="Dars 1 preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={handlePlay}
            className="absolute inset-0 flex items-center justify-center group"
            aria-label={copy.landing.playHint}
          >
            <span className="size-20 md:size-24 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center transition shadow-2xl">
              <span className="material-symbols-outlined text-4xl text-[color:var(--color-primary)]">
                play_arrow
              </span>
            </span>
          </button>
        </div>
      </main>
      <RegistrationGateModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
