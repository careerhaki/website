import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { SiteHeader } from "@/components/site-header";
import { Analytics } from "@/lib/analytics";
import { site } from "@/lib/site";

import "./globals.css";

// The fonts live in this repository (src/assets/fonts, SIL Open Font
// License; the same Google Fonts files, latin subset, via Fontsource 5.3.0),
// so a build needs no network and every build, local or CI, is identical.
// The fallbacks are size-adjusted to each font, so the swap does not shift
// the page.

// Body and interface. Variable font, so 400, 500 and 600 come from one file.
const inter = localFont({
  src: "../assets/fonts/inter-latin-wght.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-inter",
  display: "swap",
  adjustFontFallback: "Arial",
});

// Headlines. The design system uses Newsreader at one weight only (500), so
// only that weight is loaded. The headline is the largest element on most
// pages, so this file's size sets how fast the page looks finished.
const newsreader = localFont({
  src: "../assets/fonts/newsreader-latin-500.woff2",
  weight: "500",
  style: "normal",
  variable: "--font-newsreader",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

// Stage numerals only (01, 02, 03): Newsreader italic 400. Not preloaded,
// because it is used below the fold and must not compete with the headline.
const newsreaderItalic = localFont({
  src: "../assets/fonts/newsreader-latin-400-italic.woff2",
  weight: "400",
  style: "italic",
  variable: "--font-newsreader-italic",
  display: "swap",
  adjustFontFallback: "Times New Roman",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  robots: site.indexable
    ? { index: true, follow: true }
    : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#FAF6F0",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable} ${newsreaderItalic.variable}`}>
      <body>
        <SiteHeader />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
