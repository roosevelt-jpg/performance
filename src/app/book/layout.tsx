import type { Metadata } from "next";
import { loadCms } from "@/lib/cms/store";

export async function generateMetadata(): Promise<Metadata> {
  const cms = await loadCms();
  return {
    title: cms.questionnaire.title,
    description: cms.questionnaire.introDesktop,
    alternates: { canonical: "/book" },
    robots: { index: true, follow: true },
  };
}

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
