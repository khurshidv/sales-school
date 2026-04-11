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
