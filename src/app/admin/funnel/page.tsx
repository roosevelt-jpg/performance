import { AdminShell } from "@/components/admin/AdminShell";
import { FunnelAdmin } from "@/components/funnel/FunnelAdmin";

export const metadata = {
  title: "Funnel | The Formula Performance",
  robots: { index: false, follow: false },
};

export default function AdminFunnelPage() {
  return (
    <AdminShell
      title="Automation funnel"
      subtitle="Short landing, apply-in-chat, then calendar or Challenge. Edit the conversation, when it opens, and which page sections stay visible."
    >
      <FunnelAdmin />
    </AdminShell>
  );
}
