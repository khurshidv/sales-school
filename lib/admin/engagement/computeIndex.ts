import type { EngagementBlob, EngagementIndex } from '@/lib/admin/types-v2';

/**
 * Composite Interest Index, 0..10, with three weighted components:
 *   - completion (50%) : % of started days that get completed
 *   - thinking   (30%) : how close to the 5-15s sweet spot the avg choice time is
 *   - replay     (20%) : 0.1-0.3 replay rate is healthy; 0 means no engagement,
 *                        >0.5 means players grind and might be stuck
 *
 * The thinking sub-score uses a piecewise function:
 *   <2s         → 0   (clicks too fast, ignores text)
 *   2-5s        → linear ramp 0..10
 *   5-15s       → 10  (sweet spot)
 *   15-30s      → linear decay 10..5
 *   >30s        → 0   (something is broken / players stuck)
 */
export function computeInterestIndex(blob: EngagementBlob): EngagementIndex {
  const completion = clamp(blob.completion_rate * 10, 0, 10);

  const t = blob.avg_thinking_time_ms ?? 0;
  let thinking: number;
  if (t === 0) thinking = 0;
  else if (t < 2_000) thinking = 0;
  else if (t < 5_000) thinking = ((t - 2_000) / 3_000) * 10;
  else if (t <= 15_000) thinking = 10;
  else if (t <= 30_000) thinking = 10 - ((t - 15_000) / 15_000) * 5;
  else thinking = 0;

  const r = blob.replay_rate;
  let replay: number;
  if (r === 0) replay = 0;
  else if (r < 0.1) replay = (r / 0.1) * 10;
  else if (r <= 0.3) replay = 10;
  else if (r <= 1) replay = 10 - ((r - 0.3) / 0.7) * 5;
  else replay = 5;

  const score = completion * 0.5 + thinking * 0.3 + replay * 0.2;

  return {
    score: round1(score),
    components: { completion: round1(completion), thinking: round1(thinking), replay: round1(replay) },
    raw: blob,
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
