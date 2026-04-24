export type LessonIndex = 1 | 2 | 3 | 4;

export interface FunnelLesson {
  index: LessonIndex;
  title: string;
  youtubeId: string;
}

export interface QuizQuestion {
  lesson: LessonIndex;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
}

export interface FunnelProgress {
  leadId: string;
  currentLesson: LessonIndex;
  completedLessons: LessonIndex[];
  finishedAt: string | null;
}

export type FunnelEventType =
  | 'landing_view'
  | 'play_clicked'
  | 'lead_created'
  | 'lesson_opened'
  | 'quiz_shown'
  | 'quiz_wrong'
  | 'quiz_passed'
  | 'funnel_completed'
  | 'simulator_redirected';

export interface FunnelIdentity {
  leadId: string;
  token: string;
}
