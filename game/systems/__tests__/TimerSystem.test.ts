import { describe, it, expect } from 'vitest';
import {
  startTimer,
  pauseTimer,
  resumeTimer,
  getRemaining,
  isExpired,
} from '@/game/systems/TimerSystem';

describe('TimerSystem', () => {
  // --- startTimer ---
  describe('startTimer', () => {
    it('creates correct initial state', () => {
      const state = startTimer(15, 1000);
      expect(state).toEqual({
        startedAt: 1000,
        duration: 15,
        pausedAt: null,
        remaining: 15,
      });
    });
  });

  // --- getRemaining ---
  describe('getRemaining', () => {
    it('returns 10 after 5s on a 15s timer', () => {
      const state = startTimer(15, 1000);
      expect(getRemaining(state, 6000)).toBe(10);
    });

    it('returns 0 when timer is fully elapsed', () => {
      const state = startTimer(15, 1000);
      expect(getRemaining(state, 16000)).toBe(0);
    });

    it('does not return negative values', () => {
      const state = startTimer(15, 1000);
      expect(getRemaining(state, 21000)).toBe(0);
    });
  });

  // --- isExpired ---
  describe('isExpired', () => {
    it('returns false before expiry (t+14s on 15s timer)', () => {
      const state = startTimer(15, 1000);
      expect(isExpired(state, 15000)).toBe(false);
    });

    it('returns true at expiry (t+15s on 15s timer)', () => {
      const state = startTimer(15, 1000);
      expect(isExpired(state, 16000)).toBe(true);
    });
  });

  // --- pauseTimer ---
  describe('pauseTimer', () => {
    it('freezes remaining time', () => {
      const state = startTimer(15, 1000);
      const paused = pauseTimer(state, 6000); // 5s elapsed, 10s remaining
      expect(paused.pausedAt).toBe(6000);
      expect(paused.remaining).toBe(10);
    });

    it('getRemaining is consistent after pause', () => {
      const state = startTimer(15, 1000);
      const paused = pauseTimer(state, 6000);
      // Even at a later time, remaining should stay frozen
      expect(getRemaining(paused, 20000)).toBe(10);
    });

    it('double-pause is idempotent (noop)', () => {
      const state = startTimer(15, 1000);
      const paused1 = pauseTimer(state, 6000);
      const paused2 = pauseTimer(paused1, 8000); // second pause at later time
      expect(paused2).toEqual(paused1);
    });
  });

  // --- resumeTimer ---
  describe('resumeTimer', () => {
    it('continues from where it was paused', () => {
      const state = startTimer(15, 1000);
      const paused = pauseTimer(state, 6000); // 10s remaining
      const resumed = resumeTimer(paused, 10000); // resume 4s later
      // After resuming with 10s remaining at t=10000, at t=15000 (5s later) should have 5s left
      expect(getRemaining(resumed, 15000)).toBe(5);
    });
  });

  // --- edge cases ---
  describe('edge cases', () => {
    it('start with 0 duration is immediately expired', () => {
      const state = startTimer(0, 1000);
      expect(isExpired(state, 1000)).toBe(true);
    });

    it('pause already paused is noop', () => {
      const state = startTimer(10, 1000);
      const paused = pauseTimer(state, 3000);
      const paused2 = pauseTimer(paused, 5000);
      expect(paused2.pausedAt).toBe(3000);
      expect(paused2.remaining).toBe(8);
    });
  });
});
