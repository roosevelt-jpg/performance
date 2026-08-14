import { AdminShell } from "@/components/admin/AdminShell";
import { CmsAdmin } from "@/components/cms/CmsAdmin";

export const metadata = {
  title: "Content CMS | The Formula Performance",
  robots: { index: false, follow: false },
};

export default function AdminContentPage() {
  return (
    <AdminShell
      title="Content CMS"
      subtitle="Edit every public string, CTA, banner, video, and tier card. Saves to data/cms.local.json and powers the live site."
    >
      <CmsAdmin />
    </AdminShell>
  );
}
