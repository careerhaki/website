import type { Metadata, Viewport } from "next";
import { Inter, Newsreader } from "next/font/google";

import { site } from "@/lib/site";

import "./globals.css";

// Body and interface. Variable font, so 400, 500 and 600 come from one file.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Headlines. Variable weight plus the optical-size axis, so large headlines
// use the display cut and small serif text uses the text cut.
// The italic (stage numerals) is added with the stage card in module 1.3.
const newsreader = Newsreader({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-newsreader",
  display: "swap",
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
    <html lang="en" className={`${inter.variable} ${newsreader.variable}`}>
      <body>{children}</body>
    </html>
  );
}
