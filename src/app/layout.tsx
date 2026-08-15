import type { Metadata, Viewport } from "next";
import { Newsreader, Poppins } from "next/font/google";
import { Providers } from "@/components/Providers";
import { loadCms } from "@/lib/cms/store";
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
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || cms.site.brand.siteUrl;
  return {
    metadataBase: new URL(siteUrl),
    title: cms.site.seo.title,
    description: cms.site.seo.description,
    alternates: { canonical: "/" },
    openGraph: {
      title: cms.site.seo.title,
      description: cms.site.seo.description,
      url: siteUrl,
      siteName: cms.site.brand.name,
      type: "website",
    },
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
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col bg-[var(--bg)] font-sans text-[var(--fg)]">
        <Providers initial={cms}>{children}</Providers>
      </body>
    </html>
  );
}
