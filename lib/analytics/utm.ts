/**
 * UTM parameter extraction and session caching.
 * Reads from URL on first call per session, then caches in sessionStorage.
 */

const STORAGE_KEY = 'ss_utm';

export interface UTMParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string | null;
}

export function getUTMParams(): UTMParams {
  if (typeof window === 'undefined') {
    return { utm_source: null, utm_medium: null, utm_campaign: null, utm_content: null, utm_term: null, referrer: null };
  }

  // Check sessionStorage cache first
  const cached = sessionStorage.getItem(STORAGE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // fall through to re-extract
    }
  }

  const params = new URLSearchParams(window.location.search);
  const result: UTMParams = {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_content: params.get('utm_content'),
    utm_term: params.get('utm_term'),
    referrer: document.referrer || null,
  };

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result));
  return result;
}
