import { describe, expect, it } from 'vitest';
import { day1 } from '../day1';
import { day2 } from '../day2';
import { day3 } from '../day3';
import { schoolCtaCopy, type SchoolCtaEnding } from '@/components/game/screens/schoolCtaCopy';

const endingCoverage: Record<SchoolCtaEnding, true> = {
  grandmaster: true,
  success: true,
  partial: true,
  failure: true,
};

const endings = Object.keys(endingCoverage) as SchoolCtaEnding[];

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

function collectStrings(value: unknown, acc: string[] = []): string[] {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectStrings(item, acc);
    }
    return acc;
  }

  if (!value || typeof value !== 'object') {
    return acc;
  }

  for (const nestedValue of Object.values(value as Record<string, unknown>)) {
    if (typeof nestedValue === 'string') {
      acc.push(nestedValue);
      continue;
    }

    collectStrings(nestedValue, acc);
  }

  return acc;
}

describe('scenario hygiene', () => {
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
});

describe('CTA copy rules', () => {
  it('all extracted CTA strings are non-empty and trimmed', () => {
    const ctaStrings = collectStrings(schoolCtaCopy);

    expect(ctaStrings.length).toBeGreaterThan(0);
    for (const text of ctaStrings) {
      expect(text).toBe(text.trim());
      expect(text.length).toBeGreaterThan(0);
    }
  });

  it('CTA copy does not mention the old school brand', () => {
    const combined = JSON.stringify(schoolCtaCopy);

    expect(combined).not.toContain('Sales School');
  });

  it('CTA copy uses the SalesUp brand in both languages', () => {
    expect(schoolCtaCopy.schoolInfo.tagline.ru).toContain('SalesUp');
    expect(schoolCtaCopy.schoolInfo.tagline.uz).toContain('SalesUp');
    for (const ending of endings) {
      expect(schoolCtaCopy.ctaText[ending].ru).toContain('SalesUp');
      expect(schoolCtaCopy.ctaText[ending].uz).toContain('SalesUp');
    }
  });

  it('CTA copy has ru and uz text for every ending', () => {
    for (const ending of endings) {
      expect(schoolCtaCopy.headlines[ending].ru).toBeTruthy();
      expect(schoolCtaCopy.headlines[ending].uz).toBeTruthy();
      expect(schoolCtaCopy.ctaText[ending].ru).toBeTruthy();
      expect(schoolCtaCopy.ctaText[ending].uz).toBeTruthy();
    }

    expect(schoolCtaCopy.schoolInfo.tagline.ru).toBeTruthy();
    expect(schoolCtaCopy.schoolInfo.tagline.uz).toBeTruthy();
    expect(schoolCtaCopy.schoolInfo.features.ru).toBeTruthy();
    expect(schoolCtaCopy.schoolInfo.features.uz).toBeTruthy();
    expect(schoolCtaCopy.schoolInfo.results.ru).toBeTruthy();
    expect(schoolCtaCopy.schoolInfo.results.uz).toBeTruthy();
    expect(schoolCtaCopy.dismissText.ru).toBeTruthy();
    expect(schoolCtaCopy.dismissText.uz).toBeTruthy();
  });
});
