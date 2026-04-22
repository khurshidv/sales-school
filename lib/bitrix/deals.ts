// lib/bitrix/deals.ts
import 'server-only';
import { bitrixCall } from './client';

export interface BitrixDeal {
  ID: string;
  TITLE: string;
  STAGE_ID: string;
  OPPORTUNITY: string;
  CURRENCY_ID: string;
  CLOSED: 'Y' | 'N';
  DATE_CREATE: string;
  DATE_MODIFY: string;
  CONTACT_ID: string | null;
  CATEGORY_ID: string;
  UTM_SOURCE?: string | null;
}

export async function getDealById(id: number): Promise<BitrixDeal | null> {
  try {
    const result = await bitrixCall<BitrixDeal>('crm.deal.get', { id });
    return result ?? null;
  } catch (e) {
    console.warn('[bitrix.deals] getDealById failed', id, e);
    return null;
  }
}

export async function listDealsByContactIds(contactIds: number[]): Promise<BitrixDeal[]> {
  if (contactIds.length === 0) return [];
  try {
    const result = await bitrixCall<BitrixDeal[]>('crm.deal.list', {
      filter: { CONTACT_ID: contactIds },
      select: ['ID', 'TITLE', 'STAGE_ID', 'OPPORTUNITY', 'CURRENCY_ID', 'CLOSED', 'DATE_CREATE', 'CONTACT_ID', 'CATEGORY_ID'],
    });
    return result ?? [];
  } catch (e) {
    console.warn('[bitrix.deals] listDealsByContactIds failed', e);
    return [];
  }
}

export interface RevenueSummary {
  total: number;
  currency: string;
  deals: number;
}

export async function sumRevenueForPeriod(from: Date, to: Date, categoryId: number): Promise<RevenueSummary> {
  try {
    const result = await bitrixCall<BitrixDeal[]>('crm.deal.list', {
      filter: {
        CATEGORY_ID: categoryId,
        STAGE_SEMANTIC_ID: 'S', // 'S' = successful / won in Bitrix
        '>=CLOSEDATE': from.toISOString().slice(0, 10),
        '<=CLOSEDATE': to.toISOString().slice(0, 10),
      },
      select: ['ID', 'OPPORTUNITY', 'CURRENCY_ID'],
    });
    const deals = result ?? [];
    const total = deals.reduce((acc, d) => acc + Number(d.OPPORTUNITY ?? 0), 0);
    const currency = deals[0]?.CURRENCY_ID ?? 'UZS';
    return { total, currency, deals: deals.length };
  } catch (e) {
    console.warn('[bitrix.deals] sumRevenueForPeriod failed', e);
    return { total: 0, currency: 'UZS', deals: 0 };
  }
}
