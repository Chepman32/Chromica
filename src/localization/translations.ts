// Translations for Artifex

export type Language =
  | 'en'
  | 'ru'
  | 'es'
  | 'de'
  | 'fr'
  | 'pt'
  | 'ja'
  | 'zh'
  | 'ko'
  | 'uk';

export interface Translations {
  common: {
    cancel: string;
    save: string;
    delete: string;
    close: string;
    done: string;
    back: string;
  };
  settings: {
    title: string;
    theme: string;
    themeLight: string;
    themeDark: string;
    themeSolar: string;
    themeMono: string;
    sound: string;
    soundOn: string;
    soundOff: string;
    haptics: string;
    hapticsOn: string;
    hapticsOff: string;
    language: string;
    account: string;
    preferences: string;
    appearance: string;
    about: string;
    dangerZone: string;
    restorePurchases: string;
    restorePurchasesDesc: string;
    exportAllProjects: string;
    exportAllProjectsDesc: string;
    defaultExportFormat: string;
    defaultExportQuality: string;
    autoSaveProjects: string;
    autoSaveProjectsDesc: string;
    hapticFeedback: string;
    hapticFeedbackDesc: string;
    version: string;
    rateApp: string;
    rateAppDesc: string;
    contactSupport: string;
    contactSupportDesc: string;
    privacyPolicy: string;
    privacyPolicyDesc: string;
    termsOfService: string;
    termsOfServiceDesc: string;
    clearCache: string;
    clearCacheDesc: string;
    deleteAllProjects: string;
    deleteAllProjectsDesc: string;
  };
}
