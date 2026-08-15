import type { MetadataRoute } from "next";
import { loadCms } from "@/lib/cms/store";
import { absoluteUrl, siteOrigin } from "@/lib/seo/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cms = await loadCms();
  const origin = siteOrigin(cms.site.brand.siteUrl);
  const now = new Date();

  const homeImages = [
    cms.site.seo.ogImageUrl,
    cms.site.brand.logoUrl,
    cms.home.hero.portraitUrl,
    ...cms.home.testimonials.items
      .filter((item) => item.enabled)
      .flatMap((item) => [item.imageUrl, item.beforeImageUrl]),
  ]
    .filter(Boolean)
    .map((path) => absoluteUrl(cms.site.brand.siteUrl, path));

  return [
    {
      url: origin,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
      images: [...new Set(homeImages)],
    },
    {
      url: `${origin}/challenge`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}
