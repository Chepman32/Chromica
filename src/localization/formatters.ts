import type { Language, UiTranslations } from './translations';

type TranslationValues = Record<string, string | number>;

export const interpolateTranslation = (
  translation: string,
  values: TranslationValues,
): string =>
  translation.replace(/\{(\w+)\}/g, (placeholder, key: string) =>
    Object.prototype.hasOwnProperty.call(values, key)
      ? String(values[key])
      : placeholder,
  );

export const formatProjectTimestamp = (
  date: Date,
  now: Date,
  language: Language,
  strings: UiTranslations['projects'],
): string => {
  const elapsedMs = Math.max(0, now.getTime() - date.getTime());
  const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));
  const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));
  const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));

  const formatRussianRelativeTime = (
    value: number,
    unit: Intl.RelativeTimeFormatUnit,
  ) => new Intl.RelativeTimeFormat('ru', { numeric: 'always' }).format(-value, unit);

  if (elapsedMinutes < 1) return strings.justNow;
  if (elapsedMinutes < 60) {
    if (language === 'ru') {
      return formatRussianRelativeTime(elapsedMinutes, 'minute');
    }
    return interpolateTranslation(strings.minutesAgo, {
      count: elapsedMinutes,
    });
  }
  if (elapsedHours < 24) {
    if (language === 'ru') {
      return formatRussianRelativeTime(elapsedHours, 'hour');
    }
    return interpolateTranslation(strings.hoursAgo, { count: elapsedHours });
  }
  if (elapsedDays === 1) return strings.yesterday;
  if (elapsedDays < 7) {
    if (language === 'ru') {
      return formatRussianRelativeTime(elapsedDays, 'day');
    }
    return interpolateTranslation(strings.daysAgo, { count: elapsedDays });
  }

  const locale = language === 'fil' ? 'fil-PH' : language;
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
  }).format(date);
};
