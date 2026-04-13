/**
 * High-level page tracking API.
 * initPageTracking(slug) sets up all listeners and returns a cleanup function.
 * trackCTAClick() can be called independently from CTA button handlers.
 */

import { getVisitorId, getSessionId, trackPageEvent } from './page-tracker';
import { detectDeviceType, detectBrowser } from './device';
import { getUTMParams } from './utm';

const SCROLL_THROTTLE_MS = 500;
const SCROLL_THRESHOLDS = [25, 50, 75, 100];

export function initPageTracking(pageSlug: string): () => void {
  if (typeof window === 'undefined') return () => {};

  const visitorId = getVisitorId();
  const sessionId = getSessionId();
  const startTime = Date.now();
  const utm = getUTMParams();

  // 1. Track page_view with full attribution data
  trackPageEvent({
    visitor_id: visitorId,
    session_id: sessionId,
    page_slug: pageSlug,
    event_type: 'page_view',
    event_data: { url: window.location.href, title: document.title },
    utm_source: utm.utm_source,
    utm_medium: utm.utm_medium,
    utm_campaign: utm.utm_campaign,
    utm_content: utm.utm_content,
    utm_term: utm.utm_term,
    referrer: utm.referrer,
    device_type: detectDeviceType(),
    browser: detectBrowser(),
    screen_width: window.screen.width,
    screen_height: window.screen.height,
  });

  // 2. Scroll depth tracking
  const crossedThresholds = new Set<number>();
  let scrollRafId: number | null = null;
  let lastScrollCheck = 0;

  const checkScroll = () => {
    const now = Date.now();
    if (now - lastScrollCheck < SCROLL_THROTTLE_MS) return;
    lastScrollCheck = now;

    const scrollHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    if (scrollHeight <= viewportHeight) return;

    const scrolled = window.scrollY + viewportHeight;
    const percent = Math.round((scrolled / scrollHeight) * 100);

    for (const threshold of SCROLL_THRESHOLDS) {
      if (percent >= threshold && !crossedThresholds.has(threshold)) {
        crossedThresholds.add(threshold);
        trackPageEvent({
          visitor_id: visitorId,
          session_id: sessionId,
          page_slug: pageSlug,
          event_type: 'scroll_depth',
          event_data: { depth: threshold },
        });
      }
    }
  };

  const onScroll = () => {
    if (scrollRafId) return;
    scrollRafId = requestAnimationFrame(() => {
      scrollRafId = null;
      checkScroll();
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  // Check initial scroll position (user may land mid-page via anchor)
  checkScroll();

  // 3. Page leave tracking
  let hasTrackedLeave = false;

  const trackLeave = () => {
    if (hasTrackedLeave) return;
    hasTrackedLeave = true;
    const duration = Date.now() - startTime;
    trackPageEvent({
      visitor_id: visitorId,
      session_id: sessionId,
      page_slug: pageSlug,
      event_type: 'page_leave',
      event_data: {
        duration_ms: duration,
        max_scroll: Math.max(...crossedThresholds, 0),
      },
    });
  };

  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') trackLeave();
  };

  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('pagehide', trackLeave);

  // 4. Cleanup
  return () => {
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('pagehide', trackLeave);
    if (scrollRafId) cancelAnimationFrame(scrollRafId);
  };
}

export function trackCTAClick(
  pageSlug: string,
  ctaId: string,
  ctaText?: string,
  section?: string,
): void {
  if (typeof window === 'undefined') return;
  trackPageEvent({
    visitor_id: getVisitorId(),
    session_id: getSessionId(),
    page_slug: pageSlug,
    event_type: 'cta_click',
    event_data: {
      cta_id: ctaId,
      ...(ctaText && { cta_text: ctaText }),
      ...(section && { section }),
    },
  });
}
