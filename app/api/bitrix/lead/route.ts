import { NextResponse } from 'next/server';
import { bitrixCall } from '@/lib/bitrix/client';
import { createAdminClient } from '@/lib/supabase/admin';

// Associates the matching leads row (by phone, inserted in last 5 minutes,
// not yet linked to a Bitrix deal) with the deal+contact IDs. Best-effort —
// failure is logged, never thrown (Bitrix side is already done).
async function writeBackBitrixIds(phone: string, dealId: number, contactId: number): Promise<void> {
  try {
    const admin = createAdminClient();
    const cutoff = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    await admin
      .from('leads')
      .update({ bitrix_deal_id: dealId, bitrix_contact_id: contactId })
      .eq('phone', phone)
      .gte('created_at', cutoff)
      .is('bitrix_deal_id', null);
  } catch (e) {
    console.warn('[bitrix/lead] writeBackBitrixIds failed', e);
  }
}

// POST /api/bitrix/lead
// Creates (or reuses) a contact by phone, then creates a deal in the
// "Sales Up" funnel (CATEGORY_ID=334). Source is encoded into the deal TITLE
// so it is visible on the kanban card without opening it, and also into
// standard SOURCE_ID / UTM_* fields so list-view filtering works.

type SourcePage = 'home' | 'target' | 'game' | 'funnel';
type GameStage = 'onboarding' | 'consultation';

const SALES_UP_CATEGORY_ID = Number(process.env.BITRIX_SALES_UP_CATEGORY_ID ?? 334);
const C = (id: string) => `C${SALES_UP_CATEGORY_ID}:${id}`;

const STAGE_NEW = C('NEW');
const STAGE_GAME_ONB = C('UC_GAME_ONB');
const STAGE_GAME_CONS = C('UC_GAME_CONS');

// Terminal stages a deal is considered "closed" on — we never move out of these.
const TERMINAL_STAGES = new Set([C('WON'), C('LOSE'), C('APOLOGY')]);

// "Early" stages are the automated entry points the route owns.
// A new form submission is allowed to move a deal between these, but must NEVER
// pull a deal back here once a sales manager has progressed it (Дозвонились,
// Заинтересован, Дожим, etc.) — that would wipe out their work.
const EARLY_STAGES = new Set([C('NEW'), C('UC_GAME_ONB'), C('UC_GAME_CONS')]);

const SOURCE_ID_BY_PAGE: Record<SourcePage, string> = {
  target: 'SALESUP_TARGET',
  home: 'SALESUP_HOME',
  game: 'SALESUP_GAME',
  funnel: 'SALESUP_FUNNEL',
};

const SOURCE_LABEL: Record<SourcePage, string> = {
  target: 'Sales Up лендинг',
  home: 'Вебинар',
  game: 'RPG игра',
  funnel: '4 darslik voronka',
};

const SOURCE_PATH: Record<SourcePage, string> = {
  target: '/target',
  home: '/',
  game: '/game',
  funnel: '/start',
};

type Body = {
  name: string;
  phone: string;
  sourcePage: SourcePage;
  gameStage?: GameStage | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  referrer?: string | null;
  deviceType?: string | null;
  browser?: string | null;
  landingUrl?: string | null;
};

function isSourcePage(v: unknown): v is SourcePage {
  return v === 'home' || v === 'target' || v === 'game' || v === 'funnel';
}

function isGameStage(v: unknown): v is GameStage {
  return v === 'onboarding' || v === 'consultation';
}

function stageFor(sourcePage: SourcePage, gameStage: GameStage | null): string {
  if (sourcePage === 'game' && gameStage === 'onboarding') return STAGE_GAME_ONB;
  if (sourcePage === 'game' && gameStage === 'consultation') return STAGE_GAME_CONS;
  return STAGE_NEW;
}

async function findContactIdByPhone(phone: string): Promise<number | null> {
  const result = await bitrixCall<{ CONTACT?: number[] }>('crm.duplicate.findbycomm', {
    type: 'PHONE',
    values: [phone],
    entity_type: 'CONTACT',
  });
  const ids = result?.CONTACT;
  return Array.isArray(ids) && ids.length > 0 ? Number(ids[0]) : null;
}

async function createContact(name: string, phone: string): Promise<number> {
  const id = await bitrixCall<number>('crm.contact.add', {
    fields: {
      NAME: name,
      OPENED: 'Y',
      TYPE_ID: 'CLIENT',
      PHONE: [{ VALUE: phone, VALUE_TYPE: 'MOBILE' }],
    },
    params: { REGISTER_SONET_EVENT: 'N' },
  });
  return Number(id);
}

type DealSummary = { ID: string; STAGE_ID: string; DATE_CREATE: string };

// Finds the most recent non-terminal deal in Sales Up for a given contact.
// Used to move an onboarding-stage game deal forward to consultation
// instead of creating a duplicate.
async function findOpenDealForContact(contactId: number): Promise<DealSummary | null> {
  const result = await bitrixCall<DealSummary[]>('crm.deal.list', {
    filter: { CONTACT_ID: contactId, CATEGORY_ID: SALES_UP_CATEGORY_ID },
    select: ['ID', 'STAGE_ID', 'DATE_CREATE'],
    order: { DATE_CREATE: 'DESC' },
  });
  if (!Array.isArray(result)) return null;
  const open = result.find((d) => !TERMINAL_STAGES.has(d.STAGE_ID));
  return open ?? null;
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const name = (body.name ?? '').trim();
  const phone = (body.phone ?? '').trim();
  const sourcePage = body.sourcePage;
  const gameStage: GameStage | null = isGameStage(body.gameStage) ? body.gameStage : null;

  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });
  if (!phone.startsWith('+') || phone.replace(/\D/g, '').length < 8) {
    return NextResponse.json({ error: 'invalid phone' }, { status: 400 });
  }
  if (!isSourcePage(sourcePage)) {
    return NextResponse.json({ error: 'invalid sourcePage' }, { status: 400 });
  }

  try {
    const existingContactId = await findContactIdByPhone(phone);
    const contactId = existingContactId ?? (await createContact(name, phone));

    const sourceLabel = SOURCE_LABEL[sourcePage];
    const targetStage = stageFor(sourcePage, gameStage);
    const title = `${name} | ${SOURCE_PATH[sourcePage]} | Sales Up`;

    const descriptionLines = [
      `Лендинг: ${body.landingUrl || SOURCE_PATH[sourcePage]}`,
      `Источник: ${sourceLabel}${gameStage ? ` (${gameStage === 'onboarding' ? 'онбординг' : 'консультация'})` : ''}`,
      body.utmSource ? `utm_source: ${body.utmSource}` : null,
      body.utmMedium ? `utm_medium: ${body.utmMedium}` : null,
      body.utmCampaign ? `utm_campaign: ${body.utmCampaign}` : null,
      body.utmContent ? `utm_content: ${body.utmContent}` : null,
      body.utmTerm ? `utm_term: ${body.utmTerm}` : null,
      body.referrer ? `Referrer: ${body.referrer}` : null,
      body.deviceType ? `Device: ${body.deviceType}` : null,
      body.browser ? `Browser: ${body.browser}` : null,
    ].filter(Boolean);
    const description = descriptionLines.join('\n');

    // If we already have a contact, look for an open deal to move forward.
    // Onboarding: keep existing deal as-is (don't duplicate if user replays).
    // Consultation: move existing deal to consultation stage (don't duplicate).
    // Other sources (home/target): also avoid duplicates — update existing deal.
    if (existingContactId) {
      const openDeal = await findOpenDealForContact(existingContactId);

      if (openDeal) {
        const dealIsEarly = EARLY_STAGES.has(openDeal.STAGE_ID);

        // Onboarding replay: never disturb an existing deal.
        if (gameStage === 'onboarding') {
          await writeBackBitrixIds(phone, Number(openDeal.ID), contactId);
          return NextResponse.json({
            ok: true,
            contactId,
            dealId: Number(openDeal.ID),
            moved: false,
            reason: 'existing_deal_kept',
          });
        }

        // Manager already picked up the deal (Дозвонились / Заинтересован / …)
        // → don't touch the stage. Still enrich the card with the latest source
        // info so the manager sees that the user came back via a form.
        if (!dealIsEarly) {
          await bitrixCall<boolean>('crm.deal.update', {
            id: Number(openDeal.ID),
            fields: { SOURCE_DESCRIPTION: description },
            params: { REGISTER_SONET_EVENT: 'N' },
          });
          await writeBackBitrixIds(phone, Number(openDeal.ID), contactId);
          return NextResponse.json({
            ok: true,
            contactId,
            dealId: Number(openDeal.ID),
            moved: false,
            reason: 'deal_in_manager_stage',
            stage: openDeal.STAGE_ID,
          });
        }

        // Early stage → safe to move the deal to the new target stage.
        await bitrixCall<boolean>('crm.deal.update', {
          id: Number(openDeal.ID),
          fields: {
            STAGE_ID: targetStage,
            TITLE: title,
            SOURCE_ID: SOURCE_ID_BY_PAGE[sourcePage],
            SOURCE_DESCRIPTION: description,
            UTM_SOURCE: body.utmSource ?? undefined,
            UTM_MEDIUM: body.utmMedium ?? undefined,
            UTM_CAMPAIGN: body.utmCampaign ?? undefined,
            UTM_CONTENT: body.utmContent ?? undefined,
            UTM_TERM: body.utmTerm ?? undefined,
          },
          params: { REGISTER_SONET_EVENT: 'N' },
        });

        await writeBackBitrixIds(phone, Number(openDeal.ID), contactId);
        return NextResponse.json({
          ok: true,
          contactId,
          dealId: Number(openDeal.ID),
          moved: true,
          fromStage: openDeal.STAGE_ID,
          toStage: targetStage,
        });
      }
    }

    // No open deal → create a new one at the target stage.
    const dealId = await bitrixCall<number>('crm.deal.add', {
      fields: {
        TITLE: title,
        CATEGORY_ID: SALES_UP_CATEGORY_ID,
        STAGE_ID: targetStage,
        SOURCE_ID: SOURCE_ID_BY_PAGE[sourcePage],
        SOURCE_DESCRIPTION: description,
        CONTACT_IDS: [contactId],
        OPENED: 'Y',
        ASSIGNED_BY_ID: 1,
        UTM_SOURCE: body.utmSource ?? undefined,
        UTM_MEDIUM: body.utmMedium ?? undefined,
        UTM_CAMPAIGN: body.utmCampaign ?? undefined,
        UTM_CONTENT: body.utmContent ?? undefined,
        UTM_TERM: body.utmTerm ?? undefined,
      },
      params: { REGISTER_SONET_EVENT: 'N' },
    });

    await writeBackBitrixIds(phone, Number(dealId), contactId);
    return NextResponse.json({ ok: true, contactId, dealId: Number(dealId), created: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
