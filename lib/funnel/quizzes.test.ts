import { describe, it, expect } from 'vitest';
import { QUIZZES, getQuiz } from './quizzes';
import { TOTAL_LESSONS } from './lessons';

describe('QUIZZES', () => {
  it('has exactly one quiz per lesson', () => {
    expect(QUIZZES).toHaveLength(TOTAL_LESSONS);
    const lessons = QUIZZES.map((q) => q.lesson).sort();
    expect(lessons).toEqual([1, 2, 3, 4]);
  });

  it('each quiz has exactly 4 options', () => {
    for (const q of QUIZZES) {
      expect(q.options).toHaveLength(4);
    }
  });

  it('correctIndex is within 0..3', () => {
    for (const q of QUIZZES) {
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThanOrEqual(3);
    }
  });

  it('getQuiz returns null for unknown lesson', () => {
    expect(getQuiz(0)).toBeNull();
    expect(getQuiz(5)).toBeNull();
  });

  it('getQuiz returns the quiz for valid lesson', () => {
    const q = getQuiz(2);
    expect(q).not.toBeNull();
    expect(q?.lesson).toBe(2);
  });
});
