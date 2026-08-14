import { ConfirmationView } from "@/components/confirmation/ConfirmationView";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";

export default function ConfirmationPage() {
  return (
    <main className="flex min-h-dvh flex-1 flex-col">
      <SiteHeader compact />
      <div className="flex-1">
        <ConfirmationView />
      </div>
      <SiteFooter />
    </main>
  );
}
