export type InstagramItem = {
  id: string;
  type: "video" | "image";
  titleAr: string;
  titleEn: string;
  captionAr: string;
  captionEn: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  permalink: string;
  postedAt?: string;
};

export const instagramContent: InstagramItem[] = [
  {
    id: "DXl2kAGijT4",
    type: "video",
    titleAr: "ريل رسمي - تجربة الغدير",
    titleEn: "Featured Reel - Alghdeer Experience",
    captionAr: "مقتطف من أجواء الغدير الفاخرة في الصحراء.",
    captionEn: "A glimpse of Alghdeer's luxury desert atmosphere.",
    mediaUrl: "/instagram/DXl2kAGijT4.mp4",
    thumbnailUrl: "/instagram/DXl2kAGijT4.jpg",
    permalink: "https://www.instagram.com/reel/DXl2kAGijT4/",
  },
  {
    id: "event-1",
    type: "image",
    titleAr: "ليلة خاصة",
    titleEn: "Private Night",
    captionAr: "جلسات فاخرة تحت النجوم مع الضيافة العربية.",
    captionEn: "Premium starlit seating with Arabian hospitality.",
    mediaUrl: "/event1.png",
    permalink: "https://www.instagram.com/alghdeer_sa/",
  },
  {
    id: "event-2",
    type: "image",
    titleAr: "ولائم تراثية",
    titleEn: "Heritage Dining",
    captionAr: "تجربة طعام أصيلة في أجواء صحراوية راقية.",
    captionEn: "Authentic dining in an elegant desert setting.",
    mediaUrl: "/event2.png",
    permalink: "https://www.instagram.com/alghdeer_sa/",
  },
  {
    id: "event-3",
    type: "image",
    titleAr: "فعاليات الشركات",
    titleEn: "Corporate Events",
    captionAr: "مساحات مصممة لاجتماعات الشركات وبناء الفرق.",
    captionEn: "Tailored spaces for corporate retreats and team-building.",
    mediaUrl: "/event3.png",
    permalink: "https://www.instagram.com/alghdeer_sa/",
  },
  {
    id: "event-4",
    type: "image",
    titleAr: "المجلس العربي",
    titleEn: "Arabian Majlis",
    captionAr: "تفاصيل أصيلة تجمع الفخامة والهوية.",
    captionEn: "Authentic details blending identity and luxury.",
    mediaUrl: "/event4.png",
    permalink: "https://www.instagram.com/alghdeer_sa/",
  },
];
