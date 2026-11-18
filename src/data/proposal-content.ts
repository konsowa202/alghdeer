// Fixed content for the client proposal deck. Per-quote details (client, date,
// guests, items, totals) are filled from the saved quote automatically.

export const PROPOSAL_CONTACT = {
  phones: ["0594322226", "0544493991"],
  website: "www.alghder.com",
  social: "@alghdeer_sa",
  location: "جدة — طريق بريمان",
  locationEn: "Jeddah — Briman Road",
};

export const PROPOSAL_BANK = {
  bank: "مصرف الراجحي",
  beneficiary: "شركة الغادير لاند",
  account: "376000010006085581115",
  iban: "SA78 8000 0376 6080 1558 1115",
};

export const CAMP_STATS = [
  { value: "1200", label: "ضيف طاقة استيعاب المخيم", note: "من 1000 إلى 1200 ضيف" },
  { value: "250", label: "ضيف داخل القاعة الزجاجية", note: "مساحة 240 متر مربع" },
  { value: "2", label: "مدخلان للزوار", note: "مع مواقف خارجية واسعة" },
];

export const CAMP_FACILITIES = [
  "مسرح للعروض الفنية والغنائية",
  "دورات مياه منفصلة للنساء والرجال",
  "منطقة تطعيس للرانجر والبقي",
  "إسطبل ومضمار للخيل",
  "ملعب كرة طائرة",
  "جلسات خارجية",
  "خيمة تراثية",
  "بوثات أطعمة",
  "ساحة دبابات",
  "منطقة ألعاب جماعية",
  "مواقف خارجية",
];

export const EXPERIENCES = [
  { image: "/proposal/fireshow.jpg", title: "العروض الحية والنارية", en: "Live & fire shows" },
  { image: "/proposal/quads.jpg", title: "الرانجر والبقي والدبابات", en: "Rangers, buggies & quads" },
  { image: "/proposal/fireworks.jpg", title: "الألعاب النارية", en: "Fireworks" },
  { image: "/proposal/dj.jpg", title: "الطرب والدي جي", en: "Oud, singer & DJ" },
  { image: "/proposal/led.jpg", title: "عروض الإضاءة", en: "LED performances" },
  { image: "/proposal/games.jpg", title: "ألعاب ومنافسات", en: "Games & tournaments" },
];

export const EXPERIENCE_EXTRAS = [
  "الخيول والجمال",
  "أنشطة الأطفال والرسم على الوجه",
  "المهرج والدمى",
  "ألعاب الطاولة",
  "الرماية",
];

export const HOSPITALITY = [
  "القهوة السعودية",
  "التمر الفاخر",
  "الشاي بأنواعه",
  "الشوكولاتة",
  "العصيرات الباردة",
  "سناكات مالحة",
  "سناكات حلوة",
  "بوفيه العشاء",
  "ركن القهوة المختصة",
  "بوثات الأطعمة الحية",
];

export const HOSPITALITY_PHOTOS = [
  { image: "/proposal/fruit.jpg", title: "أبراج الفواكه" },
  { image: "/proposal/kunafa.jpg", title: "الكنافة النابلسية" },
  { image: "/proposal/drinks.jpg", title: "ركن المشروبات" },
];

export const NEXT_STEPS = [
  { title: "اعتماد العرض", text: "تأكيد الباقة والتاريخ وعدد الضيوف مع فريق الغدير." },
  { title: "التحويل البنكي", text: "تحويل الدفعة المتفق عليها إلى حساب الشركة الموضح." },
  { title: "تثبيت الحجز", text: "إصدار الفاتورة الرسمية وتثبيت موعد مناسبتكم." },
];
