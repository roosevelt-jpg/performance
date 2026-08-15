import type { MetadataRoute } from "next";
import { loadCms } from "@/lib/cms/store";
import { GOOGLE_CRAWLERS, siteOrigin } from "@/lib/seo/site";

const PRIVATE = [
  "/admin/",
  "/api/",
  "/integrations",
  "/book/calendar",
  "/book/confirmation",
];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const cms = await loadCms();
  const origin = siteOrigin(cms.site.brand.siteUrl);

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE,
      },
      ...GOOGLE_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: PRIVATE,
      })),
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
