import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/wedding-service";
import { safeEqual } from "@/lib/passwords";

/**
 * إعدادات الموقع من لوحة المالك (server only).
 * GET → القيم الحالية · PUT → تحديث { whatsappNumber }
 */

function authError(request) {
  if (!process.env.OWNER_PASSWORD) {
    return NextResponse.json({ error: "OWNER_PASSWORD is not set on the server" }, { status: 503 });
  }
  if (!safeEqual(request.headers.get("x-owner-password") || "", process.env.OWNER_PASSWORD)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(request) {
  const denied = authError(request);
  if (denied) return denied;
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "supabase not configured" }, { status: 503 });

  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", ["whatsapp_number"]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const map = Object.fromEntries((data || []).map((r) => [r.key, r.value]));
  return NextResponse.json({ whatsappNumber: map.whatsapp_number || "" });
}

export async function PUT(request) {
  const denied = authError(request);
  if (denied) return denied;
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "supabase not configured" }, { status: 503 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  // صيغة دولية بدون + (مثال: 213550123456) — أو فارغ لإخفاء أزرار واتساب
  const num = String(body.whatsappNumber || "").replace(/\D/g, "");
  if (num && (num.length < 8 || num.length > 15)) {
    return NextResponse.json({ error: "invalid number" }, { status: 400 });
  }

  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: "whatsapp_number", value: num, updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, whatsappNumber: num });
}
