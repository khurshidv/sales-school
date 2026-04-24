import 'server-only';

export interface FunnelLeadInput {
  name: string;
  phone: string;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  referrer?: string | null;
  deviceType?: string | null;
  browser?: string | null;
  landingUrl?: string | null;
}

export function buildLeadDbRow(input: FunnelLeadInput, funnelToken: string) {
  return {
    name: input.name.trim(),
    phone: input.phone.trim(),
    source_page: 'funnel' as const,
    funnel_token: funnelToken,
    utm_source: input.utmSource ?? null,
    utm_medium: input.utmMedium ?? null,
    utm_campaign: input.utmCampaign ?? null,
    referrer: input.referrer ?? null,
    device_type: input.deviceType ?? null,
    browser: input.browser ?? null,
  };
}

export function buildBitrixForwardBody(input: FunnelLeadInput) {
  // Shape matches the Body type in app/api/bitrix/lead/route.ts.
  return {
    name: input.name.trim(),
    phone: input.phone.trim(),
    sourcePage: 'funnel' as const,
    gameStage: null,
    utmSource: input.utmSource ?? null,
    utmMedium: input.utmMedium ?? null,
    utmCampaign: input.utmCampaign ?? null,
    utmContent: input.utmContent ?? null,
    utmTerm: input.utmTerm ?? null,
    referrer: input.referrer ?? null,
    deviceType: input.deviceType ?? null,
    browser: input.browser ?? null,
    landingUrl: input.landingUrl ?? null,
  };
}

export function isValidFunnelLeadInput(input: unknown): input is FunnelLeadInput {
  if (typeof input !== 'object' || input === null) return false;
  const r = input as Record<string, unknown>;
  if (typeof r.name !== 'string' || r.name.trim().length < 2) return false;
  if (typeof r.phone !== 'string') return false;
  const phone = r.phone.trim();
  if (!phone.startsWith('+')) return false;
  if (phone.replace(/\D/g, '').length < 8) return false;
  return true;
}
