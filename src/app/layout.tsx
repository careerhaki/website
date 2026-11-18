import type { Metadata, Viewport } from "next";
import { Inter, Newsreader } from "next/font/google";

import { SiteHeader } from "@/components/site-header";
import { Analytics } from "@/lib/analytics";
import { site } from "@/lib/site";

import "./globals.css";

// Body and interface. Variable font, so 400, 500 and 600 come from one file.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Headlines. The design system uses Newsreader at one weight only (500), so
// only that weight is loaded. The headline is the largest element on most
// pages, so this file's size sets how fast the page looks finished.
const newsreader = Newsreader({
  subsets: ["latin"],
  weight: "500",
  variable: "--font-newsreader",
  display: "swap",
});

// Stage numerals only (01, 02, 03): Newsreader italic 400. Not preloaded,
// because it is used below the fold and must not compete with the headline.
const newsreaderItalic = Newsreader({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-newsreader-italic",
  display: "swap",
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
