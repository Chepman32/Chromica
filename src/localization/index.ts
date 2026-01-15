// Localization system for Chromica

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
import { ar } from './languages/ar';
import { cs } from './languages/cs';
import { da } from './languages/da';
import { el } from './languages/el';
import { fi } from './languages/fi';
import { fil } from './languages/fil';
import { he } from './languages/he';
import { hi } from './languages/hi';
import { hu } from './languages/hu';
import { id } from './languages/id';
import { it } from './languages/it';
import { ms } from './languages/ms';
import { nl } from './languages/nl';
import { no } from './languages/no';
import { pl } from './languages/pl';
import { ro } from './languages/ro';
import { sv } from './languages/sv';
import { th } from './languages/th';
import { tr } from './languages/tr';
import { vi } from './languages/vi';

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
  ar,
  cs,
  da,
  el,
  fi,
  fil,
  he,
  hi,
  hu,
  id,
  it,
  ms,
  nl,
  no,
  pl,
  ro,
  sv,
  th,
  tr,
  vi,
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
  ar: 'العربية',
  cs: 'Čeština',
  da: 'Dansk',
  el: 'Ελληνικά',
  fi: 'Suomi',
  fil: 'Filipino',
  he: 'עברית',
  hi: 'हिन्दी',
  hu: 'Magyar',
  id: 'Bahasa Indonesia',
  it: 'Italiano',
  ms: 'Bahasa Melayu',
  nl: 'Nederlands',
  no: 'Norsk',
  pl: 'Polski',
  ro: 'Română',
  sv: 'Svenska',
  th: 'ไทย',
  tr: 'Türkçe',
  vi: 'Tiếng Việt',
};

export type { Language, Translations };
