import type { Language } from './translations';

export type EffectParameterDefaults = {
  tileCount: string;
  gap: string;
  edge: string;
  smoothness: string;
  size: string;
  ink: string;
  colorShift: string;
  colorIntensity: string;
  lightningType: string;
  position: string;
  colorMix: string;
  glowIntensity: string;
  waveAmplitude: string;
  waveFrequency: string;
};

const defineParameters = (
  values: readonly [
    string, string, string, string, string, string, string,
    string, string, string, string, string, string, string,
  ],
): EffectParameterDefaults => ({
  tileCount: values[0],
  gap: values[1],
  edge: values[2],
  smoothness: values[3],
  size: values[4],
  ink: values[5],
  colorShift: values[6],
  colorIntensity: values[7],
  lightningType: values[8],
  position: values[9],
  colorMix: values[10],
  glowIntensity: values[11],
  waveAmplitude: values[12],
  waveFrequency: values[13],
});

export const effectParameterDefaults: Record<Language, EffectParameterDefaults> = {
  en: defineParameters([
    'Tile Count', 'Gap', 'Edge', 'Smoothness', 'Size', 'Ink',
    'Color Shift', 'Color Intensity', 'Lightning Type', 'Position',
    'Color Mix', 'Glow Intensity', 'Wave Amplitude', 'Wave Frequency',
  ]),
  ru: defineParameters([
    'Количество плиток', 'Зазор', 'Края', 'Сглаживание', 'Размер', 'Чернила',
    'Сдвиг цвета', 'Интенсивность цвета', 'Тип молнии', 'Положение',
    'Смешивание цветов', 'Яркость свечения', 'Амплитуда волны', 'Частота волн',
  ]),
  es: defineParameters([
    'Número de mosaicos', 'Espacio', 'Borde', 'Suavidad', 'Tamaño', 'Tinta',
    'Desplazamiento de color', 'Intensidad del color', 'Tipo de rayo', 'Posición',
    'Mezcla de colores', 'Intensidad del brillo', 'Amplitud de onda', 'Frecuencia de onda',
  ]),
  de: defineParameters([
    'Kachelanzahl', 'Abstand', 'Kante', 'Glättung', 'Größe', 'Tinte',
    'Farbverschiebung', 'Farbintensität', 'Blitztyp', 'Position',
    'Farbmischung', 'Leuchtintensität', 'Wellenamplitude', 'Wellenfrequenz',
  ]),
  fr: defineParameters([
    'Nombre de tuiles', 'Espacement', 'Contour', 'Lissage', 'Taille', 'Encre',
    'Décalage des couleurs', 'Intensité des couleurs', "Type d’éclair", 'Position',
    'Mélange de couleurs', 'Intensité de la lueur', "Amplitude de l’onde", "Fréquence de l’onde",
  ]),
  pt: defineParameters([
    'Quantidade de blocos', 'Espaçamento', 'Borda', 'Suavidade', 'Tamanho', 'Tinta',
    'Deslocamento de cor', 'Intensidade da cor', 'Tipo de raio', 'Posição',
    'Mistura de cores', 'Intensidade do brilho', 'Amplitude da onda', 'Frequência da onda',
  ]),
  ja: defineParameters([
    'タイル数', '間隔', 'エッジ', '滑らかさ', 'サイズ', 'インク',
    '色ずれ', '色の強さ', '稲妻の種類', '位置',
    '色の混合', '発光の強さ', '波の振幅', '波の周波数',
  ]),
  zh: defineParameters([
    '拼贴数量', '间隙', '边缘', '平滑度', '大小', '墨色',
    '色彩偏移', '色彩强度', '闪电类型', '位置',
    '色彩混合', '发光强度', '波幅', '波频',
  ]),
  ko: defineParameters([
    '타일 수', '간격', '가장자리', '부드러움', '크기', '잉크',
    '색상 이동', '색상 강도', '번개 유형', '위치',
    '색상 혼합', '발광 강도', '파동 진폭', '파동 주파수',
  ]),
  uk: defineParameters([
    'Кількість плиток', 'Проміжок', 'Краї', 'Згладжування', 'Розмір', 'Чорнило',
    'Зсув кольору', 'Інтенсивність кольору', 'Тип блискавки', 'Положення',
    'Змішування кольорів', 'Яскравість сяйва', 'Амплітуда хвилі', 'Частота хвилі',
  ]),
  ar: defineParameters([
    'عدد المربعات', 'الفجوة', 'الحافة', 'النعومة', 'الحجم', 'الحبر',
    'إزاحة اللون', 'شدة اللون', 'نوع البرق', 'الموضع',
    'مزج الألوان', 'شدة التوهج', 'سعة الموجة', 'تردد الموجة',
  ]),
  cs: defineParameters([
    'Počet dlaždic', 'Mezera', 'Hrana', 'Vyhlazení', 'Velikost', 'Inkoust',
    'Posun barev', 'Intenzita barev', 'Typ blesku', 'Poloha',
    'Míchání barev', 'Intenzita záře', 'Amplituda vlny', 'Frekvence vlny',
  ]),
  da: defineParameters([
    'Antal fliser', 'Mellemrum', 'Kant', 'Udjævning', 'Størrelse', 'Blæk',
    'Farveforskydning', 'Farveintensitet', 'Lyntype', 'Placering',
    'Farveblanding', 'Glødintensitet', 'Bølgeamplitude', 'Bølgefrekvens',
  ]),
  el: defineParameters([
    'Πλήθος πλακιδίων', 'Κενό', 'Άκρη', 'Ομαλότητα', 'Μέγεθος', 'Μελάνι',
    'Μετατόπιση χρώματος', 'Ένταση χρώματος', 'Τύπος αστραπής', 'Θέση',
    'Ανάμειξη χρωμάτων', 'Ένταση λάμψης', 'Πλάτος κύματος', 'Συχνότητα κύματος',
  ]),
  fi: defineParameters([
    'Ruutujen määrä', 'Väli', 'Reuna', 'Tasaisuus', 'Koko', 'Muste',
    'Värisiirtymä', 'Värin voimakkuus', 'Salaman tyyppi', 'Sijainti',
    'Värisekoitus', 'Hehkun voimakkuus', 'Aallon amplitudi', 'Aallon taajuus',
  ]),
  fil: defineParameters([
    'Bilang ng tile', 'Agwat', 'Gilid', 'Kinis', 'Laki', 'Tinta',
    'Paglipat ng kulay', 'Tindi ng kulay', 'Uri ng kidlat', 'Posisyon',
    'Halo ng kulay', 'Tindi ng glow', 'Amplitude ng alon', 'Frequency ng alon',
  ]),
  he: defineParameters([
    'מספר אריחים', 'מרווח', 'קצה', 'החלקה', 'גודל', 'דיו',
    'הסטת צבע', 'עוצמת צבע', 'סוג ברק', 'מיקום',
    'ערבוב צבעים', 'עוצמת זוהר', 'משרעת הגל', 'תדירות הגל',
  ]),
  hi: defineParameters([
    'टाइलों की संख्या', 'अंतर', 'किनारा', 'चिकनापन', 'आकार', 'स्याही',
    'रंग बदलाव', 'रंग की तीव्रता', 'बिजली का प्रकार', 'स्थिति',
    'रंग मिश्रण', 'चमक की तीव्रता', 'तरंग आयाम', 'तरंग आवृत्ति',
  ]),
  hu: defineParameters([
    'Csempék száma', 'Hézag', 'Él', 'Simaság', 'Méret', 'Tinta',
    'Színeltolás', 'Színintenzitás', 'Villám típusa', 'Pozíció',
    'Színkeverés', 'Ragyogás intenzitása', 'Hullámamplitúdó', 'Hullámfrekvencia',
  ]),
  id: defineParameters([
    'Jumlah ubin', 'Jarak', 'Tepi', 'Kehalusan', 'Ukuran', 'Tinta',
    'Pergeseran warna', 'Intensitas warna', 'Jenis kilat', 'Posisi',
    'Campuran warna', 'Intensitas cahaya', 'Amplitudo gelombang', 'Frekuensi gelombang',
  ]),
  it: defineParameters([
    'Numero tessere', 'Spaziatura', 'Bordo', 'Morbidezza', 'Dimensione', 'Inchiostro',
    'Spostamento colore', 'Intensità colore', 'Tipo di fulmine', 'Posizione',
    'Miscela colori', 'Intensità bagliore', 'Ampiezza onda', 'Frequenza onda',
  ]),
  ms: defineParameters([
    'Bilangan jubin', 'Jarak', 'Tepi', 'Kelicinan', 'Saiz', 'Dakwat',
    'Anjakan warna', 'Keamatan warna', 'Jenis kilat', 'Kedudukan',
    'Campuran warna', 'Keamatan cahaya', 'Amplitud gelombang', 'Frekuensi gelombang',
  ]),
  nl: defineParameters([
    'Aantal tegels', 'Tussenruimte', 'Rand', 'Vloeiendheid', 'Grootte', 'Inkt',
    'Kleurverschuiving', 'Kleurintensiteit', 'Bliksemtype', 'Positie',
    'Kleurmenging', 'Gloedintensiteit', 'Golfamplitude', 'Golffrequentie',
  ]),
  no: defineParameters([
    'Antall fliser', 'Mellomrom', 'Kant', 'Jevnhet', 'Størrelse', 'Blekk',
    'Fargeforskyvning', 'Fargeintensitet', 'Lyntype', 'Plassering',
    'Fargeblanding', 'Glødintensitet', 'Bølgeamplitude', 'Bølgefrekvens',
  ]),
  pl: defineParameters([
    'Liczba kafelków', 'Odstęp', 'Krawędź', 'Wygładzenie', 'Rozmiar', 'Atrament',
    'Przesunięcie koloru', 'Intensywność koloru', 'Typ błyskawicy', 'Położenie',
    'Mieszanie kolorów', 'Intensywność poświaty', 'Amplituda fali', 'Częstotliwość fali',
  ]),
  ro: defineParameters([
    'Număr de dale', 'Spațiu', 'Margine', 'Netezime', 'Dimensiune', 'Cerneală',
    'Deplasare culoare', 'Intensitate culoare', 'Tip fulger', 'Poziție',
    'Amestec de culori', 'Intensitatea strălucirii', 'Amplitudinea undei', 'Frecvența undei',
  ]),
  sv: defineParameters([
    'Antal rutor', 'Mellanrum', 'Kant', 'Jämnhet', 'Storlek', 'Bläck',
    'Färgförskjutning', 'Färgintensitet', 'Blixttyp', 'Position',
    'Färgblandning', 'Glödintensitet', 'Vågamplitud', 'Vågfrekvens',
  ]),
  th: defineParameters([
    'จำนวนไทล์', 'ช่องว่าง', 'ขอบ', 'ความนุ่มนวล', 'ขนาด', 'หมึก',
    'การเลื่อนสี', 'ความเข้มสี', 'ประเภทสายฟ้า', 'ตำแหน่ง',
    'การผสมสี', 'ความเข้มของแสงเรือง', 'แอมพลิจูดคลื่น', 'ความถี่คลื่น',
  ]),
  tr: defineParameters([
    'Döşeme sayısı', 'Boşluk', 'Kenar', 'Pürüzsüzlük', 'Boyut', 'Mürekkep',
    'Renk kayması', 'Renk yoğunluğu', 'Şimşek türü', 'Konum',
    'Renk karışımı', 'Parlama yoğunluğu', 'Dalga genliği', 'Dalga frekansı',
  ]),
  vi: defineParameters([
    'Số ô', 'Khoảng cách', 'Cạnh', 'Độ mượt', 'Kích thước', 'Mực',
    'Dịch chuyển màu', 'Cường độ màu', 'Kiểu tia chớp', 'Vị trí',
    'Pha màu', 'Cường độ phát sáng', 'Biên độ sóng', 'Tần số sóng',
  ]),
};
