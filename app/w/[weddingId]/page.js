import InvitationApp from "@/components/InvitationApp";
import HeritageApp from "@/components/heritage/HeritageApp";
import FloralRomanticApp from "@/components/floral-romantic/FloralRomanticApp";
import InvitationNotFound from "@/components/InvitationNotFound";
import { buildAllData } from "@/lib/config-adapter";
import { getWeddingByPublicId, rowToOverrides, seoForRow } from "@/lib/wedding-service";
import { templateIdFromRow } from "@/lib/templates";
import config from "@/wedding-config.json";

/* عنوان التبويب ومعاينة المشاركة (واتساب...) باسمي العروسين الحقيقيين
   وبلغة العرس الافتراضية — لا يظهر عنوان البذرة إلا إن غاب الاسمان */
export async function generateMetadata({ params }) {
  const { weddingId } = await params;
  const { wedding } = await getWeddingByPublicId(weddingId);
  const seo = wedding ? seoForRow(wedding) : null;
  return seo || { title: config.seo.title, description: config.seo.description };
}

/* one renderer per live template in lib/templates.js */
const TEMPLATE_RENDERERS = {
  "islamic-royal": InvitationApp,
  heritage: HeritageApp,
  "floral-romantic": FloralRomanticApp,
};

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
    const Renderer = TEMPLATE_RENDERERS[templateIdFromRow(wedding)] || InvitationApp;
    return <Renderer initialData={buildAllData(rowToOverrides(wedding))} />;
  }

  // template/demo wedding from the local config keeps working
  if (weddingId === config.weddingId || !configured) {
    return <InvitationApp weddingIdOverride={weddingId} />;
  }

  return <InvitationNotFound />;
}
