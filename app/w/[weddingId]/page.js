import InvitationApp from "@/components/InvitationApp";
import InvitationNotFound from "@/components/InvitationNotFound";
import { buildAllData } from "@/lib/config-adapter";
import { getWeddingByPublicId, rowToOverrides } from "@/lib/wedding-service";
import config from "@/wedding-config.json";

export const dynamic = "force-dynamic";

/**
 * Public invitation link, one per wedding:
 *   https://your-domain.com/w/WED-7XK92P
 * Data comes from the Supabase weddings table (fetched server-side);
 * wedding-config.json is only the fallback template for anything the
 * owner did not customize.
 */
export default async function WeddingPage({ params }) {
  const { weddingId } = await params;
  const { configured, wedding } = await getWeddingByPublicId(weddingId);

  if (wedding) {
    return <InvitationApp initialData={buildAllData(rowToOverrides(wedding))} />;
  }

  // template/demo wedding from the local config keeps working
  if (weddingId === config.weddingId || !configured) {
    return <InvitationApp weddingIdOverride={weddingId} />;
  }

  return <InvitationNotFound />;
}
