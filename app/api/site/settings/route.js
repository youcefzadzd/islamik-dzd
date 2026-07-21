import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/wedding-service";
import { SITE } from "@/components/site/site-config";
import { parsePixelsValue } from "@/lib/ad-pixels";

/**
 * إعدادات الموقع العامة — قراءة فقط، للزوار.
 * يُرجع فقط القيم الآمنة للعرض العام: رقم واتساب النشاط (معروض أصلًا
 * في أزرار الموقع) ومعرّفات البيكسلات (تُحقن أصلًا في مصدر الصفحة).
 * عند غياب القيمة يرجع قيمة site-config.
 */
export async function GET() {
  let whatsappNumber = SITE.whatsappNumber || "";
  let pixels = { facebook: [], tiktok: [] };
  const supabase = getAdminClient();
  if (supabase) {
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["whatsapp_number", "ad_pixels"]);
    const map = Object.fromEntries((data || []).map((r) => [r.key, r.value]));
    if (typeof map.whatsapp_number === "string" && map.whatsapp_number.trim()) {
      whatsappNumber = map.whatsapp_number.trim();
    }
    if (map.ad_pixels) pixels = parsePixelsValue(map.ad_pixels);
  }
  return NextResponse.json(
    { whatsappNumber, pixels },
    { headers: { "Cache-Control": "public, max-age=60" } }
  );
}
