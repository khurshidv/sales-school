import type { RecentGameEvent } from '@/lib/admin/api';

export type InsightTone = 'info' | 'success' | 'warning' | 'danger';

export interface AutoInsight {
  id: string;
  title: string;
  body: string;
  tone: InsightTone;
}

const SLOW_THRESHOLD_MS = 20_000;
const DROPOFF_PLAYERS_THRESHOLD = 4;
const COMPLETION_GOOD_NEWS_THRESHOLD = 5;

/**
 * Scans a window of recent events and surfaces actionable observations:
 *   - danger : ≥4 distinct players ended on the same node without completing
 *   - warning : avg thinking time on a node ≥20s across ≥3 players
 *   - success : ≥5 day completions without any of the above
 */
export function detectAutoInsights(events: RecentGameEvent[]): AutoInsight[] {
  const insights: AutoInsight[] = [];

  const lastNodeByPlayer = new Map<string, string>();
  const completedPlayers = new Set<string>();
  for (const e of events) {
    if (e.event_type === 'node_entered') {
      const nodeId = (e.event_data as { node_id?: string }).node_id;
      if (nodeId) lastNodeByPlayer.set(e.player_id, nodeId);
    }
    if (e.event_type === 'day_completed' || e.event_type === 'game_completed') {
      completedPlayers.add(e.player_id);
    }
  }
  const dropoffByNode = new Map<string, number>();
  for (const [playerId, nodeId] of lastNodeByPlayer) {
    if (!completedPlayers.has(playerId)) {
      dropoffByNode.set(nodeId, (dropoffByNode.get(nodeId) ?? 0) + 1);
    }
  }
  for (const [nodeId, count] of dropoffByNode) {
    if (count >= DROPOFF_PLAYERS_THRESHOLD) {
      insights.push({
        id: `dropoff-${nodeId}`,
        title: 'Концентрация drop-off',
        body: `${count} игроков ушли с узла ${nodeId} в последний час без завершения дня`,
        tone: 'danger',
      });
    }
  }

  const thinkingByNode = new Map<string, number[]>();
  for (const e of events) {
    if (e.event_type !== 'choice_made') continue;
    const data = e.event_data as { node_id?: string; thinking_time_ms?: number };
    if (!data.node_id || typeof data.thinking_time_ms !== 'number') continue;
    if (!thinkingByNode.has(data.node_id)) thinkingByNode.set(data.node_id, []);
    thinkingByNode.get(data.node_id)!.push(data.thinking_time_ms);
  }
  for (const [nodeId, times] of thinkingByNode) {
    if (times.length < 3) continue;
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    if (avg >= SLOW_THRESHOLD_MS) {
      insights.push({
        id: `slow-${nodeId}`,
        title: 'Медленный узел',
        body: `Игроки задумываются на ${nodeId} в среднем ${(avg / 1000).toFixed(1)}с — стоит упростить формулировку`,
        tone: 'warning',
      });
    }
  }

  const completionsCount = events.filter(
    (e) => e.event_type === 'day_completed' || e.event_type === 'game_completed',
  ).length;
  if (insights.length === 0 && completionsCount >= COMPLETION_GOOD_NEWS_THRESHOLD) {
    insights.push({
      id: 'good-news',
      title: 'Игра идёт ровно',
      body: `${completionsCount} завершений за период, проблемных зон не обнаружено`,
      tone: 'success',
    });
  }

  return insights;
}
