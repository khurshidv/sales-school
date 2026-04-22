import { describe, it, expect } from 'vitest';
import { resolveNodeLabel } from '../nodeLabels';

describe('resolveNodeLabel', () => {
  it('returns fallback for unknown scenario', () => {
    const label = resolveNodeLabel('unknown-scenario', 'some-node');
    expect(label.title).toBe('some-node');
    expect(label.type).toBe('dialogue');
    expect(label.preview).toBeNull();
    expect(label.dayId).toBeNull();
  });

  it('returns fallback for unknown node in known scenario', () => {
    const label = resolveNodeLabel('car-dealership', 'does-not-exist');
    expect(label.title).toBe('does-not-exist');
    expect(label.preview).toBeNull();
    expect(label.dayId).toBeNull();
  });

  it('resolves a known dialogue node with RU text', () => {
    // d1_instruction is the root node of day1 — type: dialogue
    const label = resolveNodeLabel('car-dealership', 'd1_instruction');
    expect(label.type).toBe('dialogue');
    expect(label.dayId).toBe('car-day1');
    expect(label.title).toContain('симуляция'); // RU text fragment
    expect(label.preview).toContain('симуляция');
    // title must be truncated to ≤ 60 chars
    expect(label.title.length).toBeLessThanOrEqual(60);
  });

  it('resolves a known choice node with RU prompt', () => {
    // d1_exit_office_action is a choice node in day1
    const label = resolveNodeLabel('car-dealership', 'd1_exit_office_action');
    expect(label.type).toBe('choice');
    expect(label.dayId).toBe('car-day1');
    expect(label.title).toContain('спросить'); // fragment of RU prompt
    expect(label.title.length).toBeLessThanOrEqual(60);
  });

  it('resolves a day_intro node using its title', () => {
    // d1_day_intro is a day_intro node with title LocalizedText
    const label = resolveNodeLabel('car-dealership', 'd1_day_intro');
    expect(label.type).toBe('day_intro');
    expect(label.dayId).toBe('car-day1');
    expect(label.title).toContain('День 1');
  });

  it('caches subsequent lookups (same object reference)', () => {
    const first = resolveNodeLabel('car-dealership', 'd1_instruction');
    const second = resolveNodeLabel('car-dealership', 'd1_instruction');
    expect(first).toBe(second);
  });
});
