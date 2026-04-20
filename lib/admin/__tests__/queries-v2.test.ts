import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRpc = vi.fn();
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ rpc: mockRpc }),
}));

import {
  getBranchFlow,
  getNodeStats,
  getDropoffZones,
  getEngagementIndexRaw,
  periodToRange,
  getUtmFunnel,
  getDailyTrends,
  getOfferFunnelData,
  getOfferBreakdownByRating,
  getOfferBreakdownByUtm,
  getPlayerJourneyData,
  getRealtimeKpis,
} from '@/lib/admin/queries-v2';

describe('queries-v2', () => {
  beforeEach(() => { mockRpc.mockReset(); });

  it('getBranchFlow forwards args and returns rows', async () => {
    mockRpc.mockResolvedValue({ data: [{ from_node: 'a', to_node: 'b', flow_count: 5 }], error: null });
    const rows = await getBranchFlow({ scenarioId: 's', dayId: 'd1', from: null, to: null });
    expect(mockRpc).toHaveBeenCalledWith('get_branch_flow', {
      p_scenario_id: 's', p_day_id: 'd1', p_from: null, p_to: null,
    });
    expect(rows).toEqual([{ from_node: 'a', to_node: 'b', flow_count: 5 }]);
  });

  it('getNodeStats coerces avg_thinking_time_ms numeric to number', async () => {
    mockRpc.mockResolvedValue({
      data: [{ node_id: 'n', entered_count: '3', avg_thinking_time_ms: '4200.5', exit_count: '2' }],
      error: null,
    });
    const rows = await getNodeStats({ scenarioId: 's', dayId: 'd1', from: null, to: null });
    expect(rows[0].entered_count).toBe(3);
    expect(rows[0].avg_thinking_time_ms).toBeCloseTo(4200.5);
    expect(rows[0].exit_count).toBe(2);
  });

  it('getDropoffZones returns empty array when data is null', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null });
    const rows = await getDropoffZones({ scenarioId: 's', from: null, to: null });
    expect(rows).toEqual([]);
  });

  it('getEngagementIndexRaw normalizes nullable numerics', async () => {
    mockRpc.mockResolvedValue({
      data: { completion_rate: 0.75, avg_thinking_time_ms: null, replay_rate: 0.2 },
      error: null,
    });
    const blob = await getEngagementIndexRaw({ scenarioId: 's', from: null, to: null });
    expect(blob).toEqual({ completion_rate: 0.75, avg_thinking_time_ms: null, replay_rate: 0.2 });
  });

  it('periodToRange("7d") returns from = now - 7d, to = null', () => {
    const now = new Date('2026-04-17T12:00:00Z');
    const r = periodToRange('7d', now);
    expect(r.from).toBe('2026-04-10T12:00:00.000Z');
    expect(r.to).toBeNull();
  });

  it('periodToRange("all") returns nulls', () => {
    expect(periodToRange('all', new Date())).toEqual({ from: null, to: null });
  });

  // -- Phase 3 marketing queries -------------------------------------------

  it('getUtmFunnel coerces all bigint columns to number', async () => {
    mockRpc.mockResolvedValue({
      data: [
        { utm_source: 'instagram', visitors: '50', registered: '50', started: '40', completed: '20', consultations: '3' },
      ],
      error: null,
    });
    const rows = await getUtmFunnel({ from: null, to: null });
    expect(mockRpc).toHaveBeenCalledWith('get_utm_funnel', { p_from: null, p_to: null });
    expect(rows[0]).toEqual({
      utm_source: 'instagram', visitors: 50, registered: 50, started: 40, completed: 20, consultations: 3,
    });
  });

  it('getDailyTrends preserves date strings and coerces counts', async () => {
    mockRpc.mockResolvedValue({
      data: [{ bucket_date: '2026-04-10', registered: '5', game_started: '3', game_completed: '2' }],
      error: null,
    });
    const rows = await getDailyTrends({ from: null, to: null });
    expect(rows[0]).toEqual({
      bucket_date: '2026-04-10', registered: 5, game_started: 3, game_completed: 2,
    });
  });

  it('getOfferFunnelData coerces all 4 step counts and defaults zeros', async () => {
    mockRpc.mockResolvedValue({
      data: { game_completed: 10, offer_view: 8, offer_cta_click: 3, offer_conversion: 0 },
      error: null,
    });
    const f = await getOfferFunnelData({ from: null, to: null });
    expect(f).toEqual({ game_completed: 10, offer_view: 8, offer_cta_click: 3, offer_conversion: 0 });
  });

  it('getOfferFunnelData returns zeros when data is null', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null });
    const f = await getOfferFunnelData({ from: null, to: null });
    expect(f).toEqual({ game_completed: 0, offer_view: 0, offer_cta_click: 0, offer_conversion: 0 });
  });

  it('getOfferBreakdownByRating renames rating → segment', async () => {
    mockRpc.mockResolvedValue({
      data: [{ rating: 'S', views: '4', clicks: '2' }, { rating: 'A', views: '6', clicks: '1' }],
      error: null,
    });
    const rows = await getOfferBreakdownByRating({ from: null, to: null });
    expect(rows).toEqual([
      { segment: 'S', views: 4, clicks: 2 },
      { segment: 'A', views: 6, clicks: 1 },
    ]);
  });

  it('getOfferBreakdownByUtm renames utm_source → segment', async () => {
    mockRpc.mockResolvedValue({
      data: [{ utm_source: 'instagram', views: '8', clicks: '3' }],
      error: null,
    });
    const rows = await getOfferBreakdownByUtm({ from: null, to: null });
    expect(rows).toEqual([{ segment: 'instagram', views: 8, clicks: 3 }]);
  });

  // -- Phase 4 player queries ------------------------------------------------

  it('getPlayerJourneyData forwards player_id and returns events', async () => {
    mockRpc.mockResolvedValue({
      data: [
        { event_type: 'game_started', event_data: {}, scenario_id: 's', day_id: null, created_at: '2026-04-10T10:00:00Z' },
      ],
      error: null,
    });
    const events = await getPlayerJourneyData('p1');
    expect(mockRpc).toHaveBeenCalledWith('get_player_journey', { p_player_id: 'p1' });
    expect(events).toEqual([
      { event_type: 'game_started', event_data: {}, scenario_id: 's', day_id: null, created_at: '2026-04-10T10:00:00Z' },
    ]);
  });

  it('getPlayerJourneyData returns [] on error', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'boom' } });
    expect(await getPlayerJourneyData('p1')).toEqual([]);
  });

  // -- Phase 5 realtime queries --------------------------------------------

  it('getRealtimeKpis returns shape with active/today/completed counts', async () => {
    mockRpc.mockResolvedValueOnce({ data: { active: 5, today: 50, completed_today: 12 }, error: null });
    const k = await getRealtimeKpis();
    expect(mockRpc).toHaveBeenCalledWith('get_realtime_kpis');
    expect(k).toEqual({ active: 5, today: 50, completed_today: 12 });
  });

  it('getRealtimeKpis returns zeros on error', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'boom' } });
    const k = await getRealtimeKpis();
    expect(k).toEqual({ active: 0, today: 0, completed_today: 0 });
  });
});
