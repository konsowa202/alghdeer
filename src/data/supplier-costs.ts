export type SupplierCost = {
  id: string;
  nameAr: string;
  nameEn: string;
  min: number | null;
  max: number | null;
  unitAr: string;
  unitEn: string;
  quantity: number;
  noteAr: string;
};

/** Supplier costs, not final selling prices. Source: تكاليف الموردين - الورقة1.csv. */
export const SUPPLIER_COSTS: SupplierCost[] = [
  { id: "oud", nameAr: "العواد", nameEn: "Oud player", min: 500, max: 800, unitAr: "خدمة", unitEn: "service", quantity: 1, noteAr: "حسب الفنان ومدة الحضور" },
  { id: "singer", nameAr: "المغني", nameEn: "Singer", min: 800, max: 1000, unitAr: "خدمة", unitEn: "service", quantity: 1, noteAr: "حسب الفنان ومدة الحضور" },
  { id: "dj", nameAr: "دي جي", nameEn: "DJ", min: 700, max: 1200, unitAr: "خدمة", unitEn: "service", quantity: 1, noteAr: "تكلفة المورد" },
  { id: "islamic-drum", nameAr: "الطبل الإسلامي", nameEn: "Islamic drum", min: 1000, max: 1000, unitAr: "خدمة", unitEn: "service", quantity: 1, noteAr: "تكلفة المورد" },
  { id: "speakers", nameAr: "السماعات", nameEn: "Speakers", min: 800, max: 1000, unitAr: "طقم", unitEn: "set", quantity: 1, noteAr: "تكلفة المورد" },
  { id: "lighting", nameAr: "الإضاءات", nameEn: "Lighting", min: 1000, max: 1000, unitAr: "طقم", unitEn: "set", quantity: 1, noteAr: "تكلفة المورد" },
  { id: "juices", nameAr: "العصيرات", nameEn: "Juices", min: 1000, max: 1000, unitAr: "خدمة", unitEn: "service", quantity: 1, noteAr: "تكلفة المورد" },
  { id: "snacks", nameAr: "السناكات", nameEn: "Snacks", min: 1000, max: 1000, unitAr: "خدمة", unitEn: "service", quantity: 1, noteAr: "تكلفة المورد" },
  { id: "dinner-200", nameAr: "بوفيه عشاء لـ 200 شخص", nameEn: "Dinner buffet for 200 guests", min: 3000, max: 5000, unitAr: "بوفيه", unitEn: "buffet", quantity: 1, noteAr: "التكلفة للبوفيه كاملًا وليست للفرد" },
  { id: "coffee", nameAr: "مباشر القهوة", nameEn: "Coffee station attendant", min: 1000, max: 1000, unitAr: "خدمة", unitEn: "service", quantity: 1, noteAr: "تكلفة المورد" },
  { id: "cleaning", nameAr: "عمال النظافة", nameEn: "Cleaning staff", min: 1000, max: 1000, unitAr: "خدمة", unitEn: "service", quantity: 1, noteAr: "تكلفة المورد" },
  { id: "horses", nameAr: "الخيول", nameEn: "Horses", min: 1000, max: 1000, unitAr: "خدمة", unitEn: "service", quantity: 1, noteAr: "تكلفة المورد" },
  { id: "camel", nameAr: "الجمل", nameEn: "Camel", min: 700, max: 1000, unitAr: "خدمة", unitEn: "service", quantity: 1, noteAr: "تكلفة المورد" },
  { id: "wrangler", nameAr: "رانجلر — ثلاث لفات", nameEn: "Wrangler — three laps", min: 350, max: 2000, unitAr: "تجربة", unitEn: "experience", quantity: 1, noteAr: "التكلفة لتجربة ثلاث لفات" },
  { id: "tanks", nameAr: "الدبابات", nameEn: "Tracked vehicles", min: null, max: null, unitAr: "خدمة", unitEn: "service", quantity: 1, noteAr: "لا يوجد سعر مورد مسجل؛ أدخل السعر يدويًا" },
  { id: "buggy", nameAr: "سيارات البقي", nameEn: "Buggy cars", min: null, max: null, unitAr: "خدمة", unitEn: "service", quantity: 1, noteAr: "لا يوجد سعر مورد مسجل؛ أدخل السعر يدويًا" },
];

export const SUPPLIER_COSTS_NOTE = "هذه تكاليف موردين وليست أسعار بيع نهائية. إيجار المخيم والربح والضريبة تضاف عند الاقتضاء.";
