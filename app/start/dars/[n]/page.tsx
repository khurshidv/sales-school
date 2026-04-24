'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import FunnelStepper from '@/components/funnel/FunnelStepper';
import YouTubeLesson from '@/components/funnel/YouTubeLesson';
import QuizModal from '@/components/funnel/QuizModal';
import { getLesson, TOTAL_LESSONS } from '@/lib/funnel/lessons';
import { getQuiz } from '@/lib/funnel/quizzes';
import { copy } from '@/lib/funnel/copy';
import { readIdentity, postFunnelEvent } from '@/lib/funnel/progress-client';
import type { LessonIndex } from '@/lib/funnel/types';

export default function LessonPage({
  params,
}: {
  params: Promise<{ n: string }>;
}) {
  const { n } = use(params);
  const lessonNumber = Number(n);
  const router = useRouter();
  const lesson = getLesson(lessonNumber);
  const quiz = getQuiz(lessonNumber);

  const [currentLesson, setCurrentLesson] = useState<number>(lessonNumber);
  const [completed, setCompleted] = useState<LessonIndex[]>([]);
  const [stateLoaded, setStateLoaded] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);

  useEffect(() => {
    const id = readIdentity();
    if (!id) {
      router.replace('/start');
      return;
    }
    postFunnelEvent('lesson_opened', {
      leadId: id.leadId,
      token: id.token,
      lessonIndex: lessonNumber,
    });
    fetch('/api/funnel/state', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ lead_id: id.leadId, token: id.token }),
    })
      .then(async (res) => {
        if (!res.ok) {
          router.replace('/start');
          return null;
        }
        return res.json() as Promise<{
          current_lesson: number;
          completed_lessons: LessonIndex[];
        }>;
      })
      .then((state) => {
        if (!state) return;
        setCurrentLesson(state.current_lesson);
        setCompleted(state.completed_lessons ?? []);
        setStateLoaded(true);
        if (lessonNumber > state.current_lesson) {
          router.replace(`/start/dars/${state.current_lesson}`);
        }
      })
      .catch(() => router.replace('/start'));
  }, [lessonNumber, router]);

  if (!lesson || !quiz) {
    return (
      <main className="p-10 text-center">
        <p>404</p>
      </main>
    );
  }

  const preCompleted = completed.includes(lessonNumber as LessonIndex);

  const handleProceed = () => {
    if (preCompleted) {
      if (lessonNumber >= TOTAL_LESSONS) {
        router.replace('/');
        return;
      }
      router.push(`/start/dars/${lessonNumber + 1}`);
      return;
    }
    const id = readIdentity();
    postFunnelEvent('quiz_shown', {
      leadId: id?.leadId,
      token: id?.token,
      lessonIndex: lessonNumber,
    });
    setQuizOpen(true);
  };

  const handleQuizSubmit = async (answerIndex: number): Promise<boolean> => {
    const id = readIdentity();
    if (!id) return false;
    const res = await fetch('/api/funnel/quiz', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        lead_id: id.leadId,
        token: id.token,
        lesson: lessonNumber,
        answer_index: answerIndex,
      }),
    });
    if (!res.ok) return false;
    const body = (await res.json()) as { ok: boolean; next_url?: string };
    if (!body.ok) return false;
    if (body.next_url) {
      window.location.href = body.next_url;
    }
    return true;
  };

  return (
    <main className="flex flex-col items-center gap-6 pt-6 pb-16 px-5">
      <p className="text-sm text-[color:var(--color-on-surface-variant)]">
        {copy.lesson.stepCaption(lessonNumber, TOTAL_LESSONS)}
      </p>
      <FunnelStepper currentLesson={currentLesson} completedLessons={completed} />
      {stateLoaded && (
        <YouTubeLesson
          videoId={lesson.youtubeId}
          preCompleted={preCompleted}
          onProceedClick={handleProceed}
        />
      )}
      {quizOpen && (
        <QuizModal
          quiz={quiz}
          onSubmit={handleQuizSubmit}
          onBack={() => setQuizOpen(false)}
        />
      )}
    </main>
  );
}
