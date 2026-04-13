-- RPC function for admin funnel stats with COUNT(DISTINCT player_id)
CREATE OR REPLACE FUNCTION get_admin_funnel_stats()
RETURNS JSON
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'visitors', (SELECT COUNT(DISTINCT player_id) FROM game_events WHERE event_type = 'game_started'),
    'registered', (SELECT COUNT(*) FROM players),
    'started', (SELECT COUNT(DISTINCT player_id) FROM game_events WHERE event_type = 'day_started'),
    'completed', (SELECT COUNT(DISTINCT player_id) FROM completed_scenarios)
  );
$$;
