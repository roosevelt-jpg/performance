import type { Metadata } from "next";
import { loadCms } from "@/lib/cms/store";

export async function generateMetadata(): Promise<Metadata> {
  const cms = await loadCms();
  return {
    title: cms.challenge.title,
    description: cms.challenge.body,
    alternates: { canonical: "/challenge" },
    openGraph: {
      title: cms.challenge.title,
      description: cms.challenge.body,
      url: "/challenge",
    },
  };
}

export default function ChallengeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
