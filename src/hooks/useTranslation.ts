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

const recentsDefaults: Record<Language, NonNullable<Translations['recents']>> = {
  en: {
    title: 'Recent Projects',
    emptyState: {
      title: 'No Recent Projects',
      subtitle: 'Your edited projects will appear here',
    },
    deleteConfirmation: {
      title: 'Delete Project',
      message: 'Are you sure you want to delete this project? This cannot be undone.',
    },
  },
  ru: {
    title: 'Недавние проекты',
    emptyState: {
      title: 'Нет недавних проектов',
      subtitle: 'Ваши отредактированные проекты появятся здесь',
    },
    deleteConfirmation: {
      title: 'Удалить проект',
      message: 'Вы уверены, что хотите удалить этот проект? Это действие нельзя отменить.',
    },
  },
  es: {
    title: 'Proyectos Recientes',
    emptyState: {
      title: 'No Hay Proyectos Recientes',
      subtitle: 'Tus proyectos editados aparecerán aquí',
    },
    deleteConfirmation: {
      title: 'Eliminar Proyecto',
      message: '¿Estás seguro de que quieres eliminar este proyecto? Esta acción no se puede deshacer.',
    },
  },
  de: {
    title: 'Aktuelle Projekte',
    emptyState: {
      title: 'Keine aktuellen Projekte',
      subtitle: 'Ihre bearbeiteten Projekte erscheinen hier',
    },
    deleteConfirmation: {
      title: 'Projekt löschen',
      message: 'Sind Sie sicher, dass Sie dieses Projekt löschen möchten? Dies kann nicht rückgängig gemacht werden.',
    },
  },
  fr: {
    title: 'Projets Récents',
    emptyState: {
      title: 'Aucun Projet Récent',
      subtitle: 'Vos projets modifiés apparaîtront ici',
    },
    deleteConfirmation: {
      title: 'Supprimer le Projet',
      message: 'Êtes-vous sûr de vouloir supprimer ce projet ? Cette action ne peut pas être annulée.',
    },
  },
  pt: {
    title: 'Projetos Recentes',
    emptyState: {
      title: 'Nenhum Projeto Recente',
      subtitle: 'Seus projetos editados aparecerão aqui',
    },
    deleteConfirmation: {
      title: 'Excluir Projeto',
      message: 'Tem certeza de que deseja excluir este projeto? Esta ação não pode ser desfeita.',
    },
  },
  ja: {
    title: '最近のプロジェクト',
    emptyState: {
      title: '最近のプロジェクトがありません',
      subtitle: '編集したプロジェクトがここに表示されます',
    },
    deleteConfirmation: {
      title: 'プロジェクトを削除',
      message: 'このプロジェクトを削除してもよろしいですか？この操作は元に戻せません。',
    },
  },
  zh: {
    title: '最近的项目',
    emptyState: {
      title: '没有最近的项目',
      subtitle: '您编辑过的项目将显示在这里',
    },
    deleteConfirmation: {
      title: '删除项目',
      message: '您确定要删除这个项目吗？此操作无法撤销。',
    },
  },
  ko: {
    title: '최근 프로젝트',
    emptyState: {
      title: '최근 프로젝트 없음',
      subtitle: '편집한 프로젝트가 여기에 표시됩니다',
    },
    deleteConfirmation: {
      title: '프로젝트 삭제',
      message: '이 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    },
  },
  uk: {
    title: 'Недавні проєкти',
    emptyState: {
      title: 'Немає недавніх проєктів',
      subtitle: 'Ваші відредаговані проєкти з\'являться тут',
    },
    deleteConfirmation: {
      title: 'Видалити проєкт',
      message: 'Ви впевнені, що хочете видалити цей проєкт? Це не можна скасувати.',
    },
  },
  ar: {
    title: 'المشاريع الحديثة',
    emptyState: {
      title: 'لا توجد مشاريع حديثة',
      subtitle: 'ستظهر مشاريعك المعدلة هنا',
    },
    deleteConfirmation: {
      title: 'حذف المشروع',
      message: 'هل أنت متأكد من أنك تريد حذف هذا المشروع؟ لا يمكن التراجع عن هذا الإجراء.',
    },
  },
  cs: {
    title: 'Nedávné projekty',
    emptyState: {
      title: 'Žádné nedávné projekty',
      subtitle: 'Vaše upravené projekty se zobrazí zde',
    },
    deleteConfirmation: {
      title: 'Smazat projekt',
      message: 'Jste si jisti, že chcete smazat tento projekt? Toto nelze vrátit zpět.',
    },
  },
  da: {
    title: 'Seneste projekter',
    emptyState: {
      title: 'Ingen seneste projekter',
      subtitle: 'Dine redigerede projekter vil vises her',
    },
    deleteConfirmation: {
      title: 'Slet projekt',
      message: 'Er du sikker på, at du vil slette dette projekt? Dette kan ikke fortrydes.',
    },
  },
  el: {
    title: 'Πρόσφατα έργα',
    emptyState: {
      title: 'Δεν υπάρχουν πρόσφατα έργα',
      subtitle: 'Τα επεξεργασμένα έργα σας θα εμφανιστούν εδώ',
    },
    deleteConfirmation: {
      title: 'Διαγραφή έργου',
      message: 'Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το έργο; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.',
    },
  },
  fi: {
    title: 'Viimeisimmät projektit',
    emptyState: {
      title: 'Ei viimeisimpiä projekteja',
      subtitle: 'Muokkaamasi projektit näkyvät täällä',
    },
    deleteConfirmation: {
      title: 'Poista projekti',
      message: 'Oletko varma, että haluat poistaa tämän projektin? Tätä ei voi kumota.',
    },
  },
  fil: {
    title: 'Mga Kamakailang Proyekto',
    emptyState: {
      title: 'Walang Kamakailang Proyekto',
      subtitle: 'Ang iyong mga na-edit na proyekto ay lalabas dito',
    },
    deleteConfirmation: {
      title: 'Burahin ang Proyekto',
      message: 'Sigurado ka ba na gusto mong burahin ang proyektong ito? Hindi ito maaaring bawiin.',
    },
  },
  he: {
    title: 'פרויקטים אחרונים',
    emptyState: {
      title: 'אין פרויקטים אחרונים',
      subtitle: 'הפרויקטים שערכת יופיעו כאן',
    },
    deleteConfirmation: {
      title: 'מחיקת פרויקט',
      message: 'האם אתה בטוח שברצונך למחוק פרויקט זה? לא ניתן לבטל פעולה זו.',
    },
  },
  hi: {
    title: 'हाल के प्रोजेक्ट',
    emptyState: {
      title: 'कोई हाल का प्रोजेक्ट नहीं',
      subtitle: 'आपके एडिट किए गए प्रोजेक्ट यहाँ दिखाई देंगे',
    },
    deleteConfirmation: {
      title: 'प्रोजेक्ट हटाएं',
      message: 'क्या आप वाकई इस प्रोजेक्ट को हटाना चाहते हैं? इसे पूर्ववत नहीं किया जा सकता।',
    },
  },
  hu: {
    title: 'Legutóbbi projektek',
    emptyState: {
      title: 'Nincsenek legutóbbi projektek',
      subtitle: 'A szerkesztett projektjei itt fognak megjelenni',
    },
    deleteConfirmation: {
      title: 'Projekt törlése',
      message: 'Biztosan törölni szeretné ezt a projektet? Ezt nem lehet visszavonni.',
    },
  },
  id: {
    title: 'Proyek Terbaru',
    emptyState: {
      title: 'Tidak Ada Proyek Terbaru',
      subtitle: 'Proyek yang Anda edit akan muncul di sini',
    },
    deleteConfirmation: {
      title: 'Hapus Proyek',
      message: 'Apakah Anda yakin ingin menghapus proyek ini? Tindakan ini tidak dapat dibatalkan.',
    },
  },
  it: {
    title: 'Progetti Recenti',
    emptyState: {
      title: 'Nessun Progetto Recente',
      subtitle: 'I tuoi progetti modificati appariranno qui',
    },
    deleteConfirmation: {
      title: 'Elimina Progetto',
      message: 'Sei sicuro di voler eliminare questo progetto? Questa azione non può essere annullata.',
    },
  },
  ms: {
    title: 'Projek Terkini',
    emptyState: {
      title: 'Tiada Projek Terkini',
      subtitle: 'Projek yang anda edit akan muncul di sini',
    },
    deleteConfirmation: {
      title: 'Padam Projek',
      message: 'Adakah anda pasti mahu memadam projek ini? Tindakan ini tidak boleh dibatalkan.',
    },
  },
  nl: {
    title: 'Recente Projecten',
    emptyState: {
      title: 'Geen Recente Projecten',
      subtitle: 'Uw bewerkte projecten verschijnen hier',
    },
    deleteConfirmation: {
      title: 'Project Verwijderen',
      message: 'Weet u zeker dat u dit project wilt verwijderen? Dit kan niet ongedaan worden gemaakt.',
    },
  },
  no: {
    title: 'Nylige prosjekter',
    emptyState: {
      title: 'Ingen nylige prosjekter',
      subtitle: 'Dine redigerte prosjekter vil vises her',
    },
    deleteConfirmation: {
      title: 'Slett prosjekt',
      message: 'Er du sikker på at du vil slette dette prosjektet? Dette kan ikke angres.',
    },
  },
  pl: {
    title: 'Ostatnie projekty',
    emptyState: {
      title: 'Brak ostatnich projektów',
      subtitle: 'Twoje edytowane projekty pojawią się tutaj',
    },
    deleteConfirmation: {
      title: 'Usuń projekt',
      message: 'Czy na pewno chcesz usunąć ten projekt? Tej czynności nie można cofnąć.',
    },
  },
  ro: {
    title: 'Proiecte Recente',
    emptyState: {
      title: 'Niciun Proiect Recente',
      subtitle: 'Proiectele tale editate vor apărea aici',
    },
    deleteConfirmation: {
      title: 'Șterge Proiectul',
      message: 'Ești sigur că vrei să ștergi acest proiect? Această acțiune nu poate fi anulată.',
    },
  },
  sv: {
    title: 'Senaste projekt',
    emptyState: {
      title: 'Inga senaste projekt',
      subtitle: 'Dina redigerade projekt kommer att synas här',
    },
    deleteConfirmation: {
      title: 'Radera projekt',
      message: 'Är du säker på att du vill radera detta projekt? Detta kan inte ångras.',
    },
  },
  th: {
    title: 'โปรเจกต์ล่าสุด',
    emptyState: {
      title: 'ไม่มีโปรเจกต์ล่าสุด',
      subtitle: 'โปรเจกต์ที่คุณแก้ไขจะปรากฏที่นี่',
    },
    deleteConfirmation: {
      title: 'ลบโปรเจกต์',
      message: 'คุณแน่ใจหรือไม่ว่าต้องการลบโปรเจกต์นี้? ไม่สามารถยกเลิกได้',
    },
  },
  tr: {
    title: 'Son Projeler',
    emptyState: {
      title: 'Son Proje Yok',
      subtitle: 'Düzenlediğiniz projeler burada görünecektir',
    },
    deleteConfirmation: {
      title: 'Projeyi Sil',
      message: 'Bu projeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
    },
  },
  vi: {
    title: 'Dự án Gần đây',
    emptyState: {
      title: 'Không có Dự án Gần đây',
      subtitle: 'Các dự án bạn đã chỉnh sửa sẽ xuất hiện ở đây',
    },
    deleteConfirmation: {
      title: 'Xóa Dự án',
      message: 'Bạn có chắc chắn muốn xóa dự án này không? Hành động này không thể hoàn tác.',
    },
  },
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
    recents: base.recents ?? recentsDefaults[language] ?? recentsDefaults.en,
  };
};
