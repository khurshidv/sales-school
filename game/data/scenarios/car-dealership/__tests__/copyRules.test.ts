import { describe, expect, it } from 'vitest';
import { day1 } from '../day1';
import { day2 } from '../day2';
import { day3 } from '../day3';
import { schoolCtaCopy } from '@/components/game/screens/schoolCtaCopy';

function collectRuStrings(value: unknown, acc: string[] = []): string[] {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectRuStrings(item, acc);
    }
    return acc;
  }

  if (!value || typeof value !== 'object') {
    return acc;
  }

  if ('ru' in value && typeof (value as { ru?: unknown }).ru === 'string') {
    acc.push((value as { ru: string }).ru);
  }

  for (const nestedValue of Object.values(value as Record<string, unknown>)) {
    collectRuStrings(nestedValue, acc);
  }

  return acc;
}

describe('copy rules', () => {
  it('all Russian scenario strings are non-empty and trimmed', () => {
    const ruStrings = [
      ...collectRuStrings(day1),
      ...collectRuStrings(day2),
      ...collectRuStrings(day3),
    ];

    expect(ruStrings.length).toBeGreaterThan(0);
    for (const text of ruStrings) {
      expect(text).toBe(text.trim());
      expect(text.length).toBeGreaterThan(0);
    }
  });

  it('CTA copy does not mention the old school brand', () => {
    const combined = JSON.stringify(schoolCtaCopy);

    expect(combined).not.toContain('Sales School');
    expect(schoolCtaCopy.schoolInfo.tagline.ru).toContain('SalesUp');
    expect(schoolCtaCopy.schoolInfo.tagline.uz).toContain('SalesUp');
  });

  it('CTA copy uses the SalesUp brand in both languages', () => {
    expect(schoolCtaCopy.schoolInfo.tagline.ru).toContain('SalesUp');
    expect(schoolCtaCopy.schoolInfo.tagline.uz).toContain('SalesUp');
    expect(schoolCtaCopy.ctaText.grandmaster.ru).toContain('SalesUp');
    expect(schoolCtaCopy.ctaText.grandmaster.uz).toContain('SalesUp');
  });

  it('CTA copy has ru and uz text for every ending', () => {
    expect(schoolCtaCopy.headlines.grandmaster.ru).toBeTruthy();
    expect(schoolCtaCopy.headlines.grandmaster.uz).toBeTruthy();
    expect(schoolCtaCopy.headlines.success.ru).toBeTruthy();
    expect(schoolCtaCopy.headlines.success.uz).toBeTruthy();
    expect(schoolCtaCopy.headlines.partial.ru).toBeTruthy();
    expect(schoolCtaCopy.headlines.partial.uz).toBeTruthy();
    expect(schoolCtaCopy.headlines.failure.ru).toBeTruthy();
    expect(schoolCtaCopy.headlines.failure.uz).toBeTruthy();

    expect(schoolCtaCopy.ctaText.grandmaster.ru).toBeTruthy();
    expect(schoolCtaCopy.ctaText.grandmaster.uz).toBeTruthy();
    expect(schoolCtaCopy.ctaText.success.ru).toBeTruthy();
    expect(schoolCtaCopy.ctaText.success.uz).toBeTruthy();
    expect(schoolCtaCopy.ctaText.partial.ru).toBeTruthy();
    expect(schoolCtaCopy.ctaText.partial.uz).toBeTruthy();
    expect(schoolCtaCopy.ctaText.failure.ru).toBeTruthy();
    expect(schoolCtaCopy.ctaText.failure.uz).toBeTruthy();
  });
});
