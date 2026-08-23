import { CalendarPageClient } from "./CalendarPageClient";
import { getPublicRuntimeConfig } from "@/lib/integrations/runtime";

export default async function CalendarPage() {
  const config = await getPublicRuntimeConfig();
  return <CalendarPageClient runtime={config.calendar} />;
}
