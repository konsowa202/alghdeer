// Fixed content for the client proposal deck (Arabic + English).
// Per-quote details (client, date, guests, items, totals) fill in from the saved quote.

export type Lang = "ar" | "en";
export type Bi = { ar: string; en: string };

export const PROPOSAL_CONTACT = {
  phones: ["0594322226", "0544493991"],
  website: "www.alghder.com",
  social: "@alghdeer_sa",
  location: { ar: "جدة — طريق بريمان", en: "Jeddah — Briman Road" } as Bi,
};

export const PROPOSAL_BANK = {
  bank: { ar: "مصرف الراجحي", en: "Al Rajhi Bank" } as Bi,
  beneficiary: { ar: "شركة الغادير لاند", en: "Alghadir Land Co." } as Bi,
  account: "376000010006085581115",
  iban: "SA78 8000 0376 6080 1558 1115",
};

export const CAMP_STATS: { value: number; label: Bi; note: Bi }[] = [
  { value: 1200, label: { ar: "ضيف", en: "guests" }, note: { ar: "طاقة استيعاب المخيم", en: "camp capacity" } },
  { value: 250, label: { ar: "ضيف", en: "guests" }, note: { ar: "في القاعة الزجاجية", en: "in the glass hall" } },
  { value: 2, label: { ar: "مدخلان", en: "entrances" }, note: { ar: "ومواقف خارجية واسعة", en: "with ample parking" } },
];

export const MAP_POINTS: { x: number; y: number; label: Bi }[] = [
  { x: 493, y: 162, label: { ar: "القاعة الزجاجية", en: "Glass hall" } },
  { x: 249, y: 195, label: { ar: "الجلسات الخارجية", en: "Outdoor seating" } },
  { x: 62, y: 234, label: { ar: "المسرح للعروض الفنية", en: "Performance stage" } },
  { x: 674, y: 139, label: { ar: "ساحة الفعاليات", en: "Events yard" } },
  { x: 493, y: 388, label: { ar: "المدخل الرئيسي", en: "Main entrance" } },
  { x: 139, y: 379, label: { ar: "المواقف الخارجية", en: "Parking" } },
];

export const CAMP_FACILITIES: Bi[] = [
  { ar: "دورات مياه منفصلة", en: "Separate restrooms" },
  { ar: "إسطبل ومضمار للخيل", en: "Stables & horse track" },
  { ar: "منطقة تطعيس", en: "Dune-driving area" },
  { ar: "ملعب طائرة", en: "Volleyball court" },
  { ar: "خيمة تراثية", en: "Heritage tent" },
  { ar: "بوثات أطعمة", en: "Food booths" },
  { ar: "ساحة دبابات", en: "Quad-bike yard" },
];

export const GAMES: Bi[] = [
  { ar: "كرة الطائرة", en: "Volleyball" },
  { ar: "فرفيرة", en: "Foosball" },
  { ar: "كيرم", en: "Carrom" },
  { ar: "بلوت", en: "Baloot" },
  { ar: "جاكارو", en: "Jakaro" },
  { ar: "تنس الطاولة", en: "Table tennis" },
  { ar: "الرماية", en: "Archery" },
  { ar: "الخيول", en: "Horse riding" },
];

export const HOSPITALITY: Bi[] = [
  { ar: "القهوة السعودية", en: "Saudi coffee" },
  { ar: "التمر الفاخر", en: "Premium dates" },
  { ar: "الشاي بأنواعه", en: "Teas" },
  { ar: "العصيرات الباردة", en: "Cold juices" },
  { ar: "بوفيه العشاء", en: "Dinner buffet" },
  { ar: "الكنافة النابلسية", en: "Nabulsi kunafa" },
  { ar: "أبراج الفواكه", en: "Fruit towers" },
  { ar: "سناكات حلوة ومالحة", en: "Sweet & savoury snacks" },
  { ar: "القهوة المختصة", en: "Specialty coffee" },
  { ar: "بوثات أطعمة حية", en: "Live food booths" },
];

export const ADDON_GROUPS: { title: Bi; tone: "teal" | "ember" | "gold"; items: { name: Bi; price?: Bi }[] }[] = [
  {
    title: { ar: "مغامرات", en: "Adventures" },
    tone: "teal",
    items: [
      { name: { ar: "الرانجر (٣ أشخاص)", en: "Ranger (3 people)" }, price: { ar: "٣٥٠ ر.س", en: "350 SAR" } },
      { name: { ar: "الشخص الإضافي", en: "Extra person" }, price: { ar: "١٥٠ ر.س", en: "150 SAR" } },
      { name: { ar: "البقي (ساعة)", en: "Buggy (per hour)" }, price: { ar: "١٬٥٠٠ ر.س", en: "1,500 SAR" } },
      { name: { ar: "الدبابات", en: "Quad bikes" } },
    ],
  },
  {
    title: { ar: "عروض حية", en: "Live shows" },
    tone: "ember",
    items: [
      { name: { ar: "الألعاب النارية", en: "Fireworks" } },
      { name: { ar: "العروض النارية", en: "Fire show" } },
      { name: { ar: "فرقة إنشاد", en: "Inshad ensemble" } },
      { name: { ar: "دي جي أو مطرب وعود", en: "DJ or singer with oud" } },
    ],
  },
  {
    title: { ar: "ضيافة", en: "Hospitality" },
    tone: "gold",
    items: [
      { name: { ar: "الكنافة النابلسية", en: "Nabulsi kunafa" } },
      { name: { ar: "أبراج الفواكه", en: "Fruit towers" } },
      { name: { ar: "بوثات الأطعمة الحية", en: "Live food booths" } },
      { name: { ar: "ركن القهوة المختصة", en: "Specialty coffee corner" } },
    ],
  },
];

export const NEXT_STEPS: { title: Bi; text: Bi }[] = [
  {
    title: { ar: "اعتماد العرض", en: "Approve the proposal" },
    text: { ar: "تأكيد الباقة والتاريخ وعدد الضيوف مع فريق الغدير.", en: "Confirm the package, date and guest count with our team." },
  },
  {
    title: { ar: "التحويل البنكي", en: "Bank transfer" },
    text: { ar: "تحويل الدفعة المتفق عليها إلى حساب الشركة.", en: "Transfer the agreed payment to the company account." },
  },
  {
    title: { ar: "تثبيت الحجز", en: "Booking confirmed" },
    text: { ar: "إصدار الفاتورة الرسمية وتثبيت موعد مناسبتكم.", en: "We issue the official invoice and lock in your date." },
  },
];
