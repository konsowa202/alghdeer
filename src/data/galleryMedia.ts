// CMS-ready media list for the "لقطات حية من الغدير" bento.
// To swap content later (Supabase / any CMS) just return the same shape.
// Order matters: the bento layout places items by index (8 slots).

export type MediaItem = {
  id: string;
  type: "image" | "video";
  src: string;
  poster?: string;
  titleAr: string;
  titleEn: string;
};

export const galleryMedia: MediaItem[] = [
  { id: "night", type: "image", src: "/instagram/DXmF3R1ikL_.jpg", titleAr: "ليلة على أرض الغدير", titleEn: "A Night at Alghdeer" },
  { id: "hospitality", type: "image", src: "/instagram/DXmFkHbCtDS.jpg", titleAr: "تفاصيل الضيافة", titleEn: "Hospitality Details" },
  { id: "live", type: "video", src: "/instagram/DXmEhiqCpK7.mp4", poster: "/instagram/DXmEhiqCpK7.jpg", titleAr: "أجواء حية", titleEn: "Live Atmosphere" },
  { id: "walkway", type: "image", src: "/instagram/DXmF-HYikuS.jpg", titleAr: "الممر البوهيمي", titleEn: "Bohemian Walkway" },
  { id: "bespoke", type: "image", src: "/instagram/DXmAUzWitsj.jpg", titleAr: "مناسبات على مقاسك", titleEn: "Bespoke Occasions" },
  { id: "quads", type: "image", src: "/instagram/frames/frame_quad_bikes.jpg", titleAr: "مغامرات الدبابات", titleEn: "Quad Adventures" },
  { id: "inside", type: "video", src: "/instagram/DXmDKJiigK4.mp4", poster: "/instagram/DXmDKJiigK4.jpg", titleAr: "من قلب التجربة", titleEn: "Inside the Experience" },
  { id: "fireworks", type: "image", src: "/instagram/DXmC4HPiuuJ.jpg", titleAr: "سهرة وألعاب نارية", titleEn: "Fireworks Nights" },
];
