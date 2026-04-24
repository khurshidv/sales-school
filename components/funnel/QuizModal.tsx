'use client';

import { useState } from 'react';
import { copy } from '@/lib/funnel/copy';
import type { QuizQuestion } from '@/lib/funnel/types';

export default function QuizModal({
  quiz,
  onSubmit,
  onBack,
}: {
  quiz: QuizQuestion;
  onSubmit: (answerIndex: number) => Promise<boolean>;
  onBack: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [wrong, setWrong] = useState(false);

  const handleSubmit = async () => {
    if (selected === null || submitting) return;
    setSubmitting(true);
    setWrong(false);
    const ok = await onSubmit(selected);
    setSubmitting(false);
    if (!ok) {
      setWrong(true);
      setSelected(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[color:var(--color-surface)] overflow-y-auto"
    >
      <div className="min-h-dvh flex flex-col items-center justify-center px-5 py-10 gap-8 max-w-2xl mx-auto">
        <button
          type="button"
          onClick={onBack}
          className="self-start text-sm text-[color:var(--color-on-surface-variant)] underline"
        >
          {copy.quiz.back}
        </button>
        <h1 className="text-2xl md:text-3xl font-[family-name:var(--font-heading)] font-bold text-center text-[color:var(--color-on-surface)]">
          {copy.quiz.title}
        </h1>
        <p className="text-lg text-center text-[color:var(--color-on-surface)]">{quiz.question}</p>
        <ul className="flex flex-col gap-3 w-full">
          {quiz.options.map((opt, i) => {
            const active = selected === i;
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(i);
                    setWrong(false);
                  }}
                  className={`w-full text-left rounded-2xl px-5 py-4 border transition ${
                    active
                      ? 'bg-[color:var(--color-primary-container)] text-white border-transparent'
                      : 'bg-white border-[color:var(--color-on-surface-variant)]/30 hover:border-[color:var(--color-primary)]'
                  }`}
                  aria-pressed={active}
                >
                  {opt}
                </button>
              </li>
            );
          })}
        </ul>
        {wrong && (
          <p role="alert" className="text-sm font-medium text-[color:var(--color-primary)]">
            {copy.quiz.wrong}
          </p>
        )}
        <button
          type="button"
          disabled={selected === null || submitting}
          onClick={handleSubmit}
          className="rounded-full bg-[color:var(--color-primary)] text-white px-8 py-4 font-bold disabled:opacity-50"
        >
          {submitting ? copy.quiz.submitting : copy.quiz.submit}
        </button>
      </div>
    </div>
  );
}
