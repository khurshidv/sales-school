// Server-side Bitrix24 REST client. Never import from client components.
// Uses an incoming webhook URL from BITRIX_WEBHOOK_URL env var.

type BitrixResult<T> = { result: T; time?: unknown };
type BitrixError = { error: string; error_description?: string };
type BitrixResponse<T> = BitrixResult<T> | BitrixError;

const BASE_URL = process.env.BITRIX_WEBHOOK_URL;

function assertConfigured(): string {
  if (!BASE_URL) throw new Error('BITRIX_WEBHOOK_URL is not set');
  return BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;
}

function encodeValue(key: string, value: unknown, pairs: string[]): void {
  if (value === undefined || value === null) return;
  if (Array.isArray(value)) {
    value.forEach((v, i) => encodeValue(`${key}[${i}]`, v, pairs));
    return;
  }
  if (typeof value === 'object') {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      encodeValue(`${key}[${k}]`, v, pairs);
    }
    return;
  }
  pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
}

function encodeParams(params: Record<string, unknown>): string[] {
  const pairs: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    encodeValue(key, value, pairs);
  }
  return pairs;
}

export async function bitrixCall<T = unknown>(
  method: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  const base = assertConfigured();
  const body = encodeParams(params).join('&');
  const res = await fetch(`${base}${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  });
  const json = (await res.json()) as BitrixResponse<T>;
  if ('error' in json) {
    throw new Error(`Bitrix ${method} failed: ${json.error} ${json.error_description ?? ''}`.trim());
  }
  return json.result;
}
