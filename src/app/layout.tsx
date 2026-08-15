import type { Metadata, Viewport } from "next";
import { Newsreader, Poppins } from "next/font/google";
import { Providers } from "@/components/Providers";
import { GoogleTags, JsonLd } from "@/components/seo/GoogleTags";
import { loadCms } from "@/lib/cms/store";
import { loadIntegrations } from "@/lib/integrations/store";
import { buildJsonLd } from "@/lib/seo/jsonld";
import { absoluteUrl, parseKeywords, siteOrigin } from "@/lib/seo/site";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const newsreader = Newsreader({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export async function generateMetadata(): Promise<Metadata> {
  const cms = await loadCms();
  const integrations = await loadIntegrations();
  const origin = siteOrigin(cms.site.brand.siteUrl);
  const ogImage = absoluteUrl(
    cms.site.brand.siteUrl,
    cms.site.seo.ogImageUrl || cms.site.brand.logoUrl,
  );
  const keywords = parseKeywords(cms.site.seo.keywords ?? "");

  return {
    metadataBase: new URL(origin),
    title: {
      default: cms.site.seo.title,
      template: `%s | ${cms.site.brand.name}`,
    },
    description: cms.site.seo.description,
    keywords: keywords.length ? keywords : undefined,
    applicationName: cms.site.brand.name,
    authors: [{ name: cms.site.brand.coach }],
    creator: cms.site.brand.coach,
    publisher: cms.site.brand.name,
    category: "health",
    alternates: { canonical: "/" },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-video-preview": -1,
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: cms.site.seo.title,
      description: cms.site.seo.description,
      url: origin,
      siteName: cms.site.brand.name,
      locale: "en_GB",
      type: "website",
      images: [{ url: ogImage, alt: cms.site.brand.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: cms.site.seo.title,
      description: cms.site.seo.description,
      images: [ogImage],
    },
    verification: integrations.seo?.searchConsoleVerification
      ? { google: integrations.seo.searchConsoleVerification }
      : undefined,
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cms = await loadCms();
  const integrations = await loadIntegrations();
  return (
    <html
      lang="en-GB"
      className={`${poppins.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col bg-[var(--bg)] font-sans text-[var(--fg)]">
        <JsonLd data={buildJsonLd(cms)} />
        <GoogleTags
          ga4Id={integrations.seo?.ga4Id}
          gtmId={integrations.seo?.gtmId}
          adsId={integrations.seo?.googleAdsId}
        />
        <Providers initial={cms}>{children}</Providers>
      </body>
    </html>
  );
}
