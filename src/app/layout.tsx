import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { Providers } from "@/components/Providers";
import { loadCms } from "@/lib/cms/store";
import "./globals.css";

/** Match theformulaperformance.com — body: Inter, headings: Poppins */
const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const poppins = Poppins({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
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
  themeColor: "#000000",
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
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col bg-[var(--bg)] font-sans text-[var(--fg)]">
        <Providers initial={cms}>{children}</Providers>
      </body>
    </html>
  );
}
