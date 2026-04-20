import { NextResponse } from 'next/server';
import { bitrixCall } from '@/lib/bitrix/client';

// POST /api/bitrix/lead
// Creates (or reuses) a contact by phone, then creates a deal in the
// "Sales Up" funnel (CATEGORY_ID=334). Source is encoded into the deal TITLE
// so it is visible on the kanban card without opening it, and also into
// standard SOURCE_ID / UTM_* fields so list-view filtering works.

type SourcePage = 'home' | 'target' | 'game';

const SALES_UP_CATEGORY_ID = Number(process.env.BITRIX_SALES_UP_CATEGORY_ID ?? 334);

const SOURCE_ID_BY_PAGE: Record<SourcePage, string> = {
  target: 'SALESUP_TARGET',
  home: 'SALESUP_HOME',
  game: 'SALESUP_GAME',
};

const SOURCE_LABEL: Record<SourcePage, string> = {
  target: 'Sales Up лендинг',
  home: 'Вебинар',
  game: 'RPG игра',
};

type Body = {
  name: string;
  phone: string;
  sourcePage: SourcePage;
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
  return v === 'home' || v === 'target' || v === 'game';
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

  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });
  if (!phone.startsWith('+') || phone.replace(/\D/g, '').length < 8) {
    return NextResponse.json({ error: 'invalid phone' }, { status: 400 });
  }
  if (!isSourcePage(sourcePage)) {
    return NextResponse.json({ error: 'invalid sourcePage' }, { status: 400 });
  }

  try {
    const existingId = await findContactIdByPhone(phone);
    const contactId = existingId ?? (await createContact(name, phone));

    const sourceLabel = SOURCE_LABEL[sourcePage];
    const title = `Sales Up | ${sourceLabel} | ${name}`;

    const descriptionLines = [
      `Лендинг: ${body.landingUrl || `/${sourcePage === 'home' ? '' : sourcePage}`}`,
      `Источник: ${sourceLabel}`,
      body.utmSource ? `utm_source: ${body.utmSource}` : null,
      body.utmMedium ? `utm_medium: ${body.utmMedium}` : null,
      body.utmCampaign ? `utm_campaign: ${body.utmCampaign}` : null,
      body.utmContent ? `utm_content: ${body.utmContent}` : null,
      body.utmTerm ? `utm_term: ${body.utmTerm}` : null,
      body.referrer ? `Referrer: ${body.referrer}` : null,
      body.deviceType ? `Device: ${body.deviceType}` : null,
      body.browser ? `Browser: ${body.browser}` : null,
    ].filter(Boolean);

    const dealId = await bitrixCall<number>('crm.deal.add', {
      fields: {
        TITLE: title,
        CATEGORY_ID: SALES_UP_CATEGORY_ID,
        STAGE_ID: `C${SALES_UP_CATEGORY_ID}:NEW`,
        SOURCE_ID: SOURCE_ID_BY_PAGE[sourcePage],
        SOURCE_DESCRIPTION: descriptionLines.join('\n'),
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

    return NextResponse.json({ ok: true, contactId, dealId: Number(dealId) });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
