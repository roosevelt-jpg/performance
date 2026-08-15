import { extractYoutubeId } from "@/lib/media/youtube";
import type { CmsContent } from "@/lib/cms/types";
import { absoluteUrl, siteOrigin } from "./site";

function sectionOn(
  cms: CmsContent,
  homeEnabled: boolean,
  layoutKey: keyof CmsContent["funnel"]["layout"],
): boolean {
  if (cms.funnel?.enabled) return Boolean(cms.funnel.layout?.[layoutKey]);
  return homeEnabled;
}

export function buildJsonLd(cms: CmsContent): Record<string, unknown>[] {
  const origin = siteOrigin(cms.site.brand.siteUrl);
  const logo = absoluteUrl(cms.site.brand.siteUrl, cms.site.brand.logoUrl);
  const graph: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "@id": `${origin}/#business`,
      name: cms.site.brand.name,
      url: origin,
      image: logo,
      logo,
      description: cms.site.seo.description,
      founder: {
        "@type": "Person",
        name: cms.site.brand.coach,
      },
      areaServed: "GB",
      sameAs: cms.home.credentials.followerHref
        ? [cms.home.credentials.followerHref]
        : undefined,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${origin}/#website`,
      url: origin,
      name: cms.site.brand.name,
      description: cms.site.seo.description,
      inLanguage: "en-GB",
      publisher: { "@id": `${origin}/#business` },
    },
  ];

  if (sectionOn(cms, cms.home.vsl.enabled, "vsl")) {
    const videoId = extractYoutubeId(cms.home.vsl.youtubeUrl);
    if (videoId) {
      graph.push({
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: cms.home.vsl.heading,
        description: cms.home.vsl.helper || cms.site.seo.description,
        thumbnailUrl: cms.home.vsl.thumbnailUrl
          ? absoluteUrl(cms.site.brand.siteUrl, cms.home.vsl.thumbnailUrl)
          : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        contentUrl: `https://www.youtube.com/watch?v=${videoId}`,
      });
    }
  }

  const faqItems = cms.home.faq.items.filter(
    (item) => item.question.trim() && item.answer.trim(),
  );
  if (sectionOn(cms, cms.home.faq.enabled, "faq") && faqItems.length) {
    graph.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    });
  }

  return graph;
}
