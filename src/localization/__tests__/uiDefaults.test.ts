import { translations } from '../index';
import { uiDefaults } from '../uiDefaults';
import {
  formatProjectTimestamp,
  interpolateTranslation,
} from '../formatters';

const flattenKeys = (value: unknown, prefix = ''): string[] => {
  if (!value || typeof value !== 'object') return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    flattenKeys(child, prefix ? `${prefix}.${key}` : key),
  );
};

describe('runtime UI translations', () => {
  it('covers every supported language with the same non-empty keys', () => {
    const languages = Object.keys(translations);
    const expectedKeys = flattenKeys(uiDefaults.en).sort();

    expect(Object.keys(uiDefaults).sort()).toEqual(languages.sort());
    languages.forEach(language => {
      const ui = uiDefaults[language as keyof typeof uiDefaults];
      expect(flattenKeys(ui).sort()).toEqual(expectedKeys);
      flattenKeys(ui).forEach(key => {
        const value = key.split('.').reduce<any>((item, part) => item[part], ui);
        expect(value.trim()).not.toBe('');
      });
    });
  });

  it('interpolates every occurrence of a named placeholder', () => {
    expect(interpolateTranslation('{count} of {count}', { count: 3 })).toBe(
      '3 of 3',
    );
  });

  it('formats relative project dates with localized strings', () => {
    const now = new Date('2026-08-28T12:00:00.000Z');
    const strings = uiDefaults.en.projects;

    expect(formatProjectTimestamp(now, now, 'en', strings)).toBe('Just now');
    expect(
      formatProjectTimestamp(
        new Date('2026-08-28T11:55:00.000Z'),
        now,
        'en',
        strings,
      ),
    ).toBe('5 min ago');
    expect(
      formatProjectTimestamp(
        new Date('2026-08-28T09:00:00.000Z'),
        now,
        'en',
        strings,
      ),
    ).toBe('3 hr ago');
    expect(
      formatProjectTimestamp(
        new Date('2026-08-27T12:00:00.000Z'),
        now,
        'en',
        strings,
      ),
    ).toBe('Yesterday');
  });
});
