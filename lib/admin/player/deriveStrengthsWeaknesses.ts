import type { ParsedJourney, CompletedDay, PlayerStrengthsWeaknesses } from '@/lib/admin/types-v2';

const FAST_CLICKER_MS = 2_000;
const SLOW_THINKER_MS = 25_000;

/**
 * Derives qualitative strengths/weaknesses from a parsed journey + completion
 * history. Recommendation tiers:
 *   - hire  : at least one S or A across completed days
 *   - train : at least one B completion AND no failures
 *   - pass  : only F or all-failed (default for empty/no-completion data)
 */
export function deriveStrengthsWeaknesses(
  journey: ParsedJourney,
  completions: CompletedDay[],
): PlayerStrengthsWeaknesses {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (completions.length === 0 && journey.days.length === 0) {
    weaknesses.push('Нет завершённых дней — недостаточно данных для оценки');
    return { strengths, weaknesses, recommendation: 'pass', recommendationReason: 'Нет данных' };
  }

  let totalChoices = 0;
  let totalThinking = 0;
  let totalBack = 0;
  for (const d of journey.days) {
    totalChoices += d.choices_made;
    totalThinking += d.total_thinking_time_ms;
    totalBack += d.back_navigations;
  }
  const avgThinking = totalChoices > 0 ? totalThinking / totalChoices : 0;

  if (avgThinking > 0 && avgThinking < FAST_CLICKER_MS) {
    weaknesses.push('Слишком быстро принимает решения — не вчитывается в детали');
  }
  if (avgThinking > SLOW_THINKER_MS) {
    weaknesses.push('Долго сомневается на каждом выборе — может быть неуверенным');
  }
  if (totalBack >= 3) {
    weaknesses.push('Часто возвращается назад — сомневается в выборах');
  }
  if (avgThinking >= 5_000 && avgThinking <= 15_000) {
    strengths.push('Принимает решения вдумчиво и в темпе диалога');
  }
  if (journey.totalSessions > 1) {
    strengths.push(`Возвращается в игру (${journey.totalSessions} сессий) — высокая мотивация`);
  }

  const ratings = completions.map((c) => c.rating);
  const hasTopRating = ratings.includes('S') || ratings.includes('A');
  const hasMidRating = ratings.includes('B');
  const onlyFails = ratings.length > 0 && ratings.every((r) => r === 'F');
  const anyFailure = journey.days.some((d) => d.outcome === 'failed');

  if (hasTopRating) {
    strengths.push(`Получил высокую оценку (${ratings.includes('S') ? 'S' : 'A'}) — отличный продавец`);
  }
  if (completions.every((c) => c.score >= 80) && completions.length > 0) {
    strengths.push('Стабильно высокий счёт во всех днях');
  }
  if (anyFailure) {
    weaknesses.push('Провалил минимум один день — нужна работа над ошибками');
  }

  let recommendation: 'hire' | 'train' | 'pass';
  let recommendationReason: string;
  if (hasTopRating) {
    recommendation = 'hire';
    recommendationReason = 'Высокая оценка показывает готового продавца — связаться в течение 24 часов';
  } else if (hasMidRating && !onlyFails) {
    recommendation = 'train';
    recommendationReason = 'Базовые навыки есть, но требуется обучение — пригласить на собеседование';
  } else {
    recommendation = 'pass';
    recommendationReason = onlyFails
      ? 'Низкие оценки во всех днях'
      : 'Недостаточно завершённых дней или слабые показатели';
  }

  return { strengths, weaknesses, recommendation, recommendationReason };
}
