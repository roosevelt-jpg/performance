import { AdminShell } from "@/components/admin/AdminShell";
import { PurchasesAdmin } from "@/components/admin/PurchasesAdmin";

export const metadata = {
  title: "Purchases | The Formula Performance",
  robots: { index: false, follow: false },
};

export default function AdminPurchasesPage() {
  return (
    <AdminShell
      title="Purchases"
      subtitle="Live Stripe checkouts, amounts, and hosted receipts — without opening the Stripe dashboard."
    >
      <PurchasesAdmin />
    </AdminShell>
  );
}
