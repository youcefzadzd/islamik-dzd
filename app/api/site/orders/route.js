import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/wedding-service";
import { CATALOG, PRICING } from "@/components/site/site-config";

/**
 * طلبات موقع العرض (/site/order) — server only.
 * POST ينشئ صفًا في site_orders (يتطلب supabase/site-orders-migration.sql).
 * لا قراءة عامة: الاطلاع على الطلبات من Supabase Table Editor.
 */

const TEMPLATE_IDS = new Set(CATALOG.filter((c) => !c.comingSoon).map((c) => c.id));
const PACK_IDS = new Set(PRICING.map((p) => p.id));

const cleanName = (v) => String(v || "").trim();

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const groomName = cleanName(body.groomName);
  const brideName = cleanName(body.brideName);
  const weddingDate = String(body.weddingDate || "").trim();
  const venue = cleanName(body.venue);
  const phone = String(body.phone || "").trim();
  const templateId = String(body.templateId || "").trim();
  const packId = String(body.packId || "").trim();
  const lang = body.lang === "fr" ? "fr" : "ar";

  if (groomName.length < 2 || groomName.length > 60) {
    return NextResponse.json({ error: "invalid groom name" }, { status: 400 });
  }
  if (brideName.length < 2 || brideName.length > 60) {
    return NextResponse.json({ error: "invalid bride name" }, { status: 400 });
  }
  // التاريخ والمكان اختياريان — يُتحقق منهما فقط إن أُرسلا
  if (
    weddingDate &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(weddingDate) || isNaN(Date.parse(weddingDate)))
  ) {
    return NextResponse.json({ error: "invalid wedding date" }, { status: 400 });
  }
  if (venue.length > 160) {
    return NextResponse.json({ error: "invalid venue" }, { status: 400 });
  }
  // أرقام دولية أو محلية: أرقام ومسافات و+ و- فقط، 8 خانات رقمية على الأقل
  const digits = phone.replace(/\D/g, "");
  if (!/^[0-9+\s()-]{8,24}$/.test(phone) || digits.length < 8 || digits.length > 15) {
    return NextResponse.json({ error: "invalid phone" }, { status: 400 });
  }

  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "supabase not configured" }, { status: 503 });
  }

  const { error } = await supabase.from("site_orders").insert({
    groom_name: groomName,
    bride_name: brideName,
    wedding_date: weddingDate || null,
    venue: venue || null,
    phone,
    template_id: TEMPLATE_IDS.has(templateId) ? templateId : null,
    pack_id: PACK_IDS.has(packId) ? packId : null,
    lang,
  });

  if (error) {
    // جدول غير موجود = الهجرة لم تُنفذ بعد — رسالة أوضح للتشخيص
    const missing =
      error.message.includes("site_orders") &&
      /does not exist|schema cache|could not find/i.test(error.message);
    return NextResponse.json(
      { error: missing ? "site_orders table missing — run site-orders-migration.sql" : error.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
