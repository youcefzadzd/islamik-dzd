import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/wedding-service";
import { SITE } from "@/components/site/site-config";

/**
 * إعدادات الموقع العامة — قراءة فقط، للزوار.
 * يُرجع فقط القيم الآمنة للعرض العام (رقم واتساب النشاط معروض
 * أصلًا في أزرار الموقع). عند غياب القيمة يرجع قيمة site-config.
 */
export async function GET() {
  let whatsappNumber = SITE.whatsappNumber || "";
  const supabase = getAdminClient();
  if (supabase) {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "whatsapp_number")
      .maybeSingle();
    if (data && typeof data.value === "string" && data.value.trim()) {
      whatsappNumber = data.value.trim();
    }
  }
  return NextResponse.json(
    { whatsappNumber },
    { headers: { "Cache-Control": "public, max-age=60" } }
  );
}
