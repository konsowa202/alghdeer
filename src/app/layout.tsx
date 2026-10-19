import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";

const ibmPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-ibm",
});

export const metadata: Metadata = {
  title: "ALGHDEER camp | مخيمات الغدير — جدة • طريق بريمان",
  description:
    "مخيمات الغدير (@alghdeer_sa) — وجهتكم الشتوية والرمضانية الأضخم في جدة (طريق بريمان) لاستضافة فعاليات الشركات الكبرى، الغبقات الرمضانية، والاحتفالات الخاصة.",
  icons: {
    icon: "/logo-dark-bg.png",
    shortcut: "/logo-dark-bg.png",
    apple: "/logo-dark-bg.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${ibmPlex.variable}`}>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
