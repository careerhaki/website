import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

// Every public page, by path. Add each page here as it is built (module 1.4).
const paths = ["/", "/the-ascent", "/results", "/book-a-call", "/about"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((path) => ({
    url: `${site.url}${path === "/" ? "" : path}`,
  }));
}
