// Localization system for Artifex

import { Language, Translations } from './translations';
import { en } from './languages/en';
import { ru } from './languages/ru';
import { es } from './languages/es';
import { de } from './languages/de';
import { fr } from './languages/fr';
import { pt } from './languages/pt';
import { ja } from './languages/ja';
import { zh } from './languages/zh';
import { ko } from './languages/ko';
import { uk } from './languages/uk';

export const translations: Record<Language, Translations> = {
  en,
  ru,
  es,
  de,
  fr,
  pt,
  ja,
  zh,
  ko,
  uk,
};

export const languageNames: Record<Language, string> = {
  en: 'English',
  ru: 'Русский',
  es: 'Español',
  de: 'Deutsch',
  fr: 'Français',
  pt: 'Português',
  ja: '日本語',
  zh: '中文',
  ko: '한국어',
  uk: 'Українська',
};

export type { Language, Translations };
