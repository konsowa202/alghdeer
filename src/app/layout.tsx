import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";

const ibmPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-ibm",
});

const siteTitle = "ALGHDEER camp | مخيمات الغدير — جدة • طريق بريمان";
const siteDescription =
  "مخيمات الغدير (@alghdeer_sa) — وجهتكم الشتوية والرمضانية الأضخم في جدة (طريق بريمان) لاستضافة فعاليات الشركات الكبرى، الغبقات الرمضانية، والاحتفالات الخاصة.";
const socialImage = "/og-alghdeer.jpg";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.alghder.com"),
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "/",
    siteName: "ALGHDEER camp",
    locale: "ar_SA",
    type: "website",
    images: [
      {
        url: socialImage,
        width: 1200,
        height: 630,
        alt: "ALGHDEER camp — مخيمات الغدير",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [socialImage],
  },
  icons: {
    icon: [
      {
        url: "/alghdeer-favicon-v2.ico?v=20261105",
        type: "image/x-icon",
        sizes: "any",
      },
      {
        url: "/alghdeer-icon-v2.png?v=20261105",
        type: "image/png",
        sizes: "512x512",
      },
    ],
    shortcut: "/alghdeer-favicon-v2.ico?v=20261105",
    apple: "/alghdeer-apple-icon-v2.png?v=20261105",
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
