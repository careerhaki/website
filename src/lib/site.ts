import type { Metadata } from "next";

const PRODUCTION_URL = "https://careerhaki.com";

/**
 * Preview deployments describe themselves with their own address so social
 * cards can be tested there; everything else uses the production address.
 */
const url =
  process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : PRODUCTION_URL;

export const site = {
  name: "CareerHaki",
  url,
  title: "CareerHaki | Career coaching and mentorship in tech",
  description:
    "End-to-end career coaching and mentorship for graduates and early-career people in tech, from engineers doing the work today.",
  locale: "en_CA",
  /**
   * Search engines may index the site only on production after launch.
   * SITE_LIVE is set to 1 on Vercel in module 1.6.
   */
  indexable:
    process.env.VERCEL_ENV === "production" && process.env.SITE_LIVE === "1",
} as const;

type PageMetadataInput = {
  /** Path from the site root, starting with a slash. */
  path: string;
  /** Page title without the site name. Omit on the homepage. */
  title?: string;
  description?: string;
};

/**
 * Metadata for one page: title, description, canonical address and the
 * matching social-card fields. Next.js replaces nested objects such as
 * `openGraph` instead of merging them, so each page sets them in full here.
 */
export function pageMetadata({
  path,
  title,
  description = site.description,
}: PageMetadataInput): Metadata {
  const fullTitle = title ? `${title} | ${site.name}` : site.title;

  return {
    title: title ?? { absolute: site.title },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: site.locale,
      url: path,
      title: fullTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}
