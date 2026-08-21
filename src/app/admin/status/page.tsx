import { AdminShell } from "@/components/admin/AdminShell";
import { StatusAdmin } from "@/components/admin/StatusAdmin";

export const metadata = {
  title: "Status | The Formula Performance",
  robots: { index: false, follow: false },
};

export default function AdminStatusPage() {
  return (
    <AdminShell
      title="Status"
      subtitle="See which APIs are configured and run live connection tests for CRM, calendar, Stripe, email, and storage."
    >
      <StatusAdmin />
    </AdminShell>
  );
}
