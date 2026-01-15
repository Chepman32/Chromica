// Translation hook for accessing current language translations

import { useAppStore } from '../stores/appStore';
import { Language, Translations, translations } from '../localization';

const homeDefaults: Record<Language, NonNullable<Translations['home']>> = {
  en: {
    tapToStartEditing: 'Tap to start editing',
    startEditing: 'Start Editing',
    selectImageHint: 'Select an image to apply stunning effects',
    recent: 'Recent',
    mixes: 'Mixes',
  },
  ru: {
    tapToStartEditing: 'Нажмите, чтобы начать редактирование',
    startEditing: 'Начать редактирование',
    selectImageHint: 'Выберите изображение, чтобы применить эффекты',
    recent: 'Недавние',
    mixes: 'Миксы',
  },
  es: {
    tapToStartEditing: 'Toca para empezar a editar',
    startEditing: 'Empezar a editar',
    selectImageHint: 'Selecciona una imagen para aplicar efectos',
    recent: 'Recientes',
    mixes: 'Mezclas',
  },
  de: {
    tapToStartEditing: 'Tippe, um mit der Bearbeitung zu beginnen',
    startEditing: 'Bearbeitung starten',
    selectImageHint: 'Wähle ein Bild aus, um Effekte anzuwenden',
    recent: 'Zuletzt',
    mixes: 'Mixes',
  },
  fr: {
    tapToStartEditing: 'Touchez pour commencer à éditer',
    startEditing: 'Commencer à éditer',
    selectImageHint: 'Sélectionnez une image pour appliquer des effets',
    recent: 'Récents',
    mixes: 'Mixes',
  },
  pt: {
    tapToStartEditing: 'Toque para começar a editar',
    startEditing: 'Começar a editar',
    selectImageHint: 'Selecione uma imagem para aplicar efeitos',
    recent: 'Recentes',
    mixes: 'Mixes',
  },
  ja: {
    tapToStartEditing: 'タップして編集を開始',
    startEditing: '編集を開始',
    selectImageHint: '画像を選択して効果を適用',
    recent: '最近',
    mixes: 'ミックス',
  },
  zh: {
    tapToStartEditing: '轻点开始编辑',
    startEditing: '开始编辑',
    selectImageHint: '选择一张图片以应用效果',
    recent: '最近',
    mixes: '混合',
  },
  ko: {
    tapToStartEditing: '탭하여 편집 시작',
    startEditing: '편집 시작',
    selectImageHint: '이미지를 선택하여 효과 적용',
    recent: '최근',
    mixes: '믹스',
  },
  uk: {
    tapToStartEditing: 'Натисніть, щоб почати редагування',
    startEditing: 'Почати редагування',
    selectImageHint: 'Виберіть зображення, щоб застосувати ефекти',
    recent: 'Нещодавні',
    mixes: 'Мікси',
  },
  ar: {
    tapToStartEditing: 'اضغط لبدء التحرير',
    startEditing: 'ابدأ التحرير',
    selectImageHint: 'اختر صورة لتطبيق التأثيرات',
    recent: 'الأخيرة',
    mixes: 'مزج',
  },
  cs: {
    tapToStartEditing: 'Klepněte pro zahájení úprav',
    startEditing: 'Začít upravovat',
    selectImageHint: 'Vyberte obrázek pro použití efektů',
    recent: 'Nedávné',
    mixes: 'Mixy',
  },
  da: {
    tapToStartEditing: 'Tryk for at begynde at redigere',
    startEditing: 'Start redigering',
    selectImageHint: 'Vælg et billede for at anvende effekter',
    recent: 'Seneste',
    mixes: 'Mix',
  },
  el: {
    tapToStartEditing: 'Πατήστε για να ξεκινήσετε την επεξεργασία',
    startEditing: 'Έναρξη επεξεργασίας',
    selectImageHint: 'Επιλέξτε εικόνα για εφαρμογή εφέ',
    recent: 'Πρόσφατα',
    mixes: 'Μίξεις',
  },
  fi: {
    tapToStartEditing: 'Napauta aloittaaksesi muokkauksen',
    startEditing: 'Aloita muokkaus',
    selectImageHint: 'Valitse kuva tehosteiden käyttöön',
    recent: 'Viimeisimmät',
    mixes: 'Mixit',
  },
  fil: {
    tapToStartEditing: 'I-tap para magsimulang mag-edit',
    startEditing: 'Simulan ang pag-edit',
    selectImageHint: 'Pumili ng larawan para mag-apply ng effects',
    recent: 'Kamakailan',
    mixes: 'Mixes',
  },
  he: {
    tapToStartEditing: 'הקש כדי להתחיל לערוך',
    startEditing: 'התחל עריכה',
    selectImageHint: 'בחר תמונה כדי להחיל אפקטים',
    recent: 'אחרונים',
    mixes: 'מיקסים',
  },
  hi: {
    tapToStartEditing: 'एडिटिंग शुरू करने के लिए टैप करें',
    startEditing: 'एडिटिंग शुरू करें',
    selectImageHint: 'इफेक्ट्स लागू करने के लिए एक इमेज चुनें',
    recent: 'हाल के',
    mixes: 'मिक्स',
  },
  hu: {
    tapToStartEditing: 'Koppints a szerkesztés indításához',
    startEditing: 'Szerkesztés indítása',
    selectImageHint: 'Válassz egy képet az effektek alkalmazásához',
    recent: 'Legutóbbi',
    mixes: 'Mixek',
  },
  id: {
    tapToStartEditing: 'Ketuk untuk mulai mengedit',
    startEditing: 'Mulai mengedit',
    selectImageHint: 'Pilih gambar untuk menerapkan efek',
    recent: 'Terbaru',
    mixes: 'Mix',
  },
  it: {
    tapToStartEditing: 'Tocca per iniziare a modificare',
    startEditing: 'Inizia a modificare',
    selectImageHint: 'Seleziona un’immagine per applicare effetti',
    recent: 'Recenti',
    mixes: 'Mix',
  },
  ms: {
    tapToStartEditing: 'Ketik untuk mula mengedit',
    startEditing: 'Mula mengedit',
    selectImageHint: 'Pilih imej untuk gunakan kesan',
    recent: 'Terkini',
    mixes: 'Campuran',
  },
  nl: {
    tapToStartEditing: 'Tik om te beginnen met bewerken',
    startEditing: 'Bewerken starten',
    selectImageHint: 'Selecteer een afbeelding om effecten toe te passen',
    recent: 'Recent',
    mixes: 'Mixes',
  },
  no: {
    tapToStartEditing: 'Trykk for å begynne å redigere',
    startEditing: 'Start redigering',
    selectImageHint: 'Velg et bilde for å bruke effekter',
    recent: 'Nylig',
    mixes: 'Mikser',
  },
  pl: {
    tapToStartEditing: 'Dotknij, aby rozpocząć edycję',
    startEditing: 'Rozpocznij edycję',
    selectImageHint: 'Wybierz obraz, aby zastosować efekty',
    recent: 'Ostatnie',
    mixes: 'Miksy',
  },
  ro: {
    tapToStartEditing: 'Atinge pentru a începe editarea',
    startEditing: 'Începe editarea',
    selectImageHint: 'Selectează o imagine pentru a aplica efecte',
    recent: 'Recente',
    mixes: 'Mixuri',
  },
  sv: {
    tapToStartEditing: 'Tryck för att börja redigera',
    startEditing: 'Börja redigera',
    selectImageHint: 'Välj en bild för att använda effekter',
    recent: 'Senaste',
    mixes: 'Mixar',
  },
  th: {
    tapToStartEditing: 'แตะเพื่อเริ่มแก้ไข',
    startEditing: 'เริ่มแก้ไข',
    selectImageHint: 'เลือกรูปภาพเพื่อใช้เอฟเฟกต์',
    recent: 'ล่าสุด',
    mixes: 'มิกซ์',
  },
  tr: {
    tapToStartEditing: 'Düzenlemeye başlamak için dokunun',
    startEditing: 'Düzenlemeyi başlat',
    selectImageHint: 'Efekt uygulamak için bir görsel seçin',
    recent: 'Son',
    mixes: 'Karışımlar',
  },
  vi: {
    tapToStartEditing: 'Chạm để bắt đầu chỉnh sửa',
    startEditing: 'Bắt đầu chỉnh sửa',
    selectImageHint: 'Chọn ảnh để áp dụng hiệu ứng',
    recent: 'Gần đây',
    mixes: 'Bản phối',
  },
};

const liquidMenuDefaults: NonNullable<Translations['liquidMenu']> = {
  openImagePicker: 'Open image picker',
  doubleTapToEdit: 'Double tap to select an image to edit',
};

export const useTranslation = () => {
  const language = useAppStore(state => state.preferences?.language || 'en');
  const _languageVersion = useAppStore(state => state._languageVersion);
  // Use language version to force re-render when language changes
  // Reference _languageVersion to satisfy linter
  _languageVersion;

  const base = translations[language] ?? translations.en;
  const liquidMenu =
    (base as any)?.liquidMenu ?? (base as any)?.settings?.liquidMenu ?? liquidMenuDefaults;

  return {
    ...base,
    home: base.home ?? homeDefaults[language] ?? homeDefaults.en,
    liquidMenu,
  };
};
