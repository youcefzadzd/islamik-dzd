import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/wedding-service";
import { authOwnerOrStaff } from "@/lib/staff-auth";
import { normalizePixels, parsePixelsValue } from "@/lib/ad-pixels";

/**
 * إعدادات الموقع من لوحة المالك (server only).
 * GET → القيم الحالية · PUT → تحديث الحقول المُرسلة فقط:
 *   { whatsappNumber }  و/أو  { pixels: { facebook: [...], tiktok: [...] } }
 */

/* مالك، أو عامل يملك صلاحية «settings» */
async function authError(request) {
  const auth = await authOwnerOrStaff(request, "settings");
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  return null;
}

export async function GET(request) {
  const denied = await authError(request);
  if (denied) return denied;
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "supabase not configured" }, { status: 503 });

  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", ["whatsapp_number", "ad_pixels"]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const map = Object.fromEntries((data || []).map((r) => [r.key, r.value]));
  return NextResponse.json({
    whatsappNumber: map.whatsapp_number || "",
    pixels: parsePixelsValue(map.ad_pixels || ""),
  });
}

export async function PUT(request) {
  const denied = await authError(request);
  if (denied) return denied;
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "supabase not configured" }, { status: 503 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const result = {};

  /* رقم واتساب — فقط إن أُرسل الحقل */
  if ("whatsappNumber" in body) {
    // صيغة دولية بدون + (مثال: 213550123456) — أو فارغ لإخفاء أزرار واتساب
    const num = String(body.whatsappNumber || "").replace(/\D/g, "");
    if (num && (num.length < 8 || num.length > 15)) {
      return NextResponse.json({ error: "invalid number" }, { status: 400 });
    }
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "whatsapp_number", value: num, updated_at: now });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    result.whatsappNumber = num;
  }

  /* بيكسلات الإعلانات — فقط إن أُرسل الحقل؛ التنظيف يتكفل بالصيغ الخاطئة */
  if ("pixels" in body) {
    const pixels = normalizePixels(body.pixels);
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "ad_pixels", value: JSON.stringify(pixels), updated_at: now });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    result.pixels = pixels;
  }

  return NextResponse.json({ ok: true, ...result });
}
