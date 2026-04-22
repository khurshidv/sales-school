// lib/bitrix/stages.ts
import 'server-only';

const CATEGORY_ID = Number(process.env.BITRIX_SALES_UP_CATEGORY_ID ?? 334);
const C = (id: string) => `C${CATEGORY_ID}:${id}`;

export type StageTone = 'default' | 'progress' | 'won' | 'lost';

export interface StageInfo {
  label: string;
  tone: StageTone;
}

export const STAGE_LABELS: Record<string, StageInfo> = {
  [C('NEW')]: { label: 'Новый', tone: 'default' },
  [C('UC_GAME_ONB')]: { label: 'Игра: онбординг', tone: 'progress' },
  [C('UC_GAME_CONS')]: { label: 'Игра: консультация', tone: 'progress' },
  [C('UC_CALLED')]: { label: 'Дозвонились', tone: 'progress' },
  [C('UC_INTERESTED')]: { label: 'Заинтересован', tone: 'progress' },
  [C('UC_CLOSING')]: { label: 'Дожим', tone: 'progress' },
  [C('WON')]: { label: 'Закрыто: купил', tone: 'won' },
  [C('LOSE')]: { label: 'Закрыто: отказ', tone: 'lost' },
  [C('APOLOGY')]: { label: 'Не подошёл', tone: 'lost' },
};

export function stageLabel(stageId: string | null | undefined): StageInfo {
  if (!stageId) return { label: 'Без сделки', tone: 'default' };
  return STAGE_LABELS[stageId] ?? { label: stageId, tone: 'default' };
}

export function stageIsWon(stageId: string | null | undefined): boolean {
  return !!stageId && STAGE_LABELS[stageId]?.tone === 'won';
}
