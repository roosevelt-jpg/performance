"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { IntegrationsAdmin } from "@/components/integrations/IntegrationsAdmin";

export default function AdminIntegrationsPage() {
  return (
    <AdminShell
      title="Integrations"
      subtitle="CRM, Google Calendar / Calendly booking APIs, and Q9 pricing. Keep secrets here — marketing copy lives in Content CMS."
    >
      <IntegrationsAdmin embedded />
    </AdminShell>
  );
}
