export interface FunnelStats {
  visitors: number;
  registered: number;
  started: number;
  completed: number;
}

export interface Player {
  id: string;
  display_name: string;
  phone: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
  created_at: string;
  last_activity: string | null;
}

export interface RatingCount {
  rating: string;
  count: number;
}

export interface ScenarioStats {
  scenario_id: string;
  play_count: number;
  avg_score: number;
  avg_time_seconds: number;
}

export interface DayDropoff {
  day_id: string;
  started: number;
  completed: number;
  dropoff_rate: number;
}

export interface GameMetrics {
  avg_score: number;
  total_completions: number;
  ratings: RatingCount[];
  scenarios: ScenarioStats[];
  dayDropoff: DayDropoff[];
}

export interface LeaderboardEntry {
  player_id: string;
  display_name: string;
  total_score: number;
  scenarios_completed: number;
  level: number;
  updated_at: string;
}

// Page Analytics types

export interface PageSummary {
  page_slug: string;
  total_views: number;
  unique_visitors: number;
  bounce_rate: number;
  avg_duration_ms: number;
  conversion_rate: number;
}

export interface UTMBreakdown {
  source: string;
  medium: string;
  campaign: string;
  views: number;
  unique_visitors: number;
}

export interface DeviceBreakdown {
  device_type: string;
  count: number;
}

export interface ReferrerBreakdown {
  referrer: string;
  count: number;
}

export interface ScrollDepthEntry {
  depth: number;
  count: number;
}

export interface DailyViews {
  date: string;
  views: number;
  unique_visitors: number;
}

export interface PageBreakdowns {
  utm_breakdown: UTMBreakdown[];
  device_breakdown: DeviceBreakdown[];
  referrer_breakdown: ReferrerBreakdown[];
  scroll_depth: ScrollDepthEntry[];
  daily_views: DailyViews[];
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  source_page: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  device_type: string | null;
  browser: string | null;
  referrer: string | null;
  created_at: string;
}
