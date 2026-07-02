import {
  Amiri,
  Aref_Ruqaa,
  Playfair_Display,
  Cormorant_Garamond,
  Pinyon_Script,
} from "next/font/google";
import invitationData from "@/data/invitationData";
import { buildThemeCssVariables } from "@/lib/theme";
import "./globals.css";

// خط الآيات القرآنية والدعاء — طباعة عربية كلاسيكية فاخرة
const arabicText = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-arabic-text",
  display: "swap",
});

// خط أسماء العروسين — خط عربي مزخرف فاخر
const arabicDisplay = Aref_Ruqaa({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-arabic-display",
  display: "swap",
});

const serifFont = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const bodyFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

// خط الحروف الأولى (monogram) داخل ختم الشمع — خط كلاسيكي مزخرف
const monogramFont = Pinyon_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-monogram",
  display: "swap",
});

export const metadata = {
  title: invitationData.seo.title,
  description: invitationData.seo.description,
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: invitationData.theme.colors.ivory,
};

export default function RootLayout({ children }) {
  const themeCssVariables = buildThemeCssVariables(invitationData.theme.colors);

  return (
    <html lang="fr">
      <head>
        <style
          dangerouslySetInnerHTML={{ __html: `:root { ${themeCssVariables} }` }}
        />
      </head>
      <body
        className={`${arabicText.variable} ${arabicDisplay.variable} ${serifFont.variable} ${bodyFont.variable} ${monogramFont.variable} bg-ivory text-ink antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
