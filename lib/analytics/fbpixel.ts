// Thin wrapper around window.fbq. Safe to call from anywhere — if the pixel
// is not loaded (e.g. outside /start route group, or NEXT_PUBLIC_FACEBOOK_PIXEL_ID
// is empty) the helper silently no-ops.

type FbStandardEvent =
  | 'PageView'
  | 'ViewContent'
  | 'Lead'
  | 'CompleteRegistration'
  | 'InitiateCheckout'
  | 'Contact'
  | 'SubmitApplication';

type FbEventParams = {
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  value?: number;
  currency?: string;
  [key: string]: unknown;
};

export function trackFB(event: FbStandardEvent, params?: FbEventParams): void {
  if (typeof window === 'undefined') return;
  if (typeof window.fbq !== 'function') return;
  if (params) {
    window.fbq('track', event, params);
  } else {
    window.fbq('track', event);
  }
}

export function trackFBCustom(event: string, params?: FbEventParams): void {
  if (typeof window === 'undefined') return;
  if (typeof window.fbq !== 'function') return;
  if (params) {
    window.fbq('trackCustom', event, params);
  } else {
    window.fbq('trackCustom', event);
  }
}
