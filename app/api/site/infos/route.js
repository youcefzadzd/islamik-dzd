import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/wedding-service";

/**
 * استقبال استمارة معلومات العرس من /infos — تلتصق بالطلب نفسه:
 *   1) ?order=<id> في رابط الاستمارة (يرسله المالك للزبون) → الطلب المحدد
 *   2) وإلا: أحدث طلب برقم هاتف مطابق
 *   3) وإلا: طلب جديد في «En confirmation» يحمل الاستمارة
 * الاستمارة تُحفظ في site_orders.client_info (jsonb) وتظهر داخل
 * بطاقة الطلب في لوحة التحكم ← Commandes.
 */

const s = (v, max = 200) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

/* آخر 9 أرقام تكفي للمطابقة (تتجاوز اختلاف 0 / 213 / +213) */
const phoneKey = (v) => String(v || "").replace(/\D/g, "").slice(-9);

export async function POST(request) {
  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const groom = s(body.groomFr, 80);
  const bride = s(body.brideFr, 80);
  const phone = s(body.phone, 30).replace(/[^\d+ ]/g, "");
  if (groom.length < 2 || bride.length < 2 || phone.replace(/\D/g, "").length < 8) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const date = s(body.date, 10);
  const info = {
    groomFr: groom,
    groomAr: s(body.groomAr, 80),
    brideFr: bride,
    brideAr: s(body.brideAr, 80),
    honoree: body.honoree === "bride" ? "bride" : "groom",
    father: s(body.father, 80),
    mother: s(body.mother, 80),
    date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "",
    time: s(body.time, 5),
    venue: s(body.venue, 120),
    address: s(body.address, 200),
    maps: s(body.maps, 300),
    template: s(body.template, 40),
    pack: s(body.pack, 40),
    program: s(body.program, 2000),
    notes: s(body.notes, 2000),
    phone,
    lang: body.lang === "fr" ? "fr" : "ar",
  };

  /* 1) الطلب المحدد في الرابط الشخصي */
  const orderId = s(body.orderId, 40);
  let order = null;
  if (/^[0-9a-f-]{36}$/i.test(orderId)) {
    const { data } = await supabase
      .from("site_orders")
      .select("id, wedding_date, venue, template_id, pack_id")
      .eq("id", orderId)
      .maybeSingle();
    order = data || null;
  }

  /* 2) أحدث طلب برقم هاتف مطابق */
  if (!order) {
    const { data } = await supabase
      .from("site_orders")
      .select("id, phone, wedding_date, venue, template_id, pack_id")
      .order("created_at", { ascending: false })
      .limit(200);
    order =
      (data || []).find((o) => phoneKey(o.phone) === phoneKey(phone)) || null;
  }

  const stamp = new Date().toISOString();

  if (order) {
    /* الاستمارة تلتصق بالطلب — وتكمل الحقول الفارغة فيه فقط */
    const update = { client_info: info, client_info_at: stamp };
    if (!order.wedding_date && info.date) update.wedding_date = info.date;
    if (!order.venue && info.venue) update.venue = info.venue;
    if (!order.template_id && info.template) update.template_id = info.template;
    if (!order.pack_id && info.pack) update.pack_id = info.pack;
    const { error } = await supabase.from("site_orders").update(update).eq("id", order.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, attached: true });
  }

  /* 3) لا طلب مطابق → طلب جديد يدخل مسار التأكيد حاملًا الاستمارة */
  const { error } = await supabase.from("site_orders").insert({
    groom_name: groom,
    bride_name: bride,
    wedding_date: info.date || null,
    venue: info.venue || null,
    phone,
    template_id: info.template || null,
    pack_id: info.pack || null,
    lang: info.lang,
    status: "new",
    client_info: info,
    client_info_at: stamp,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, attached: false });
}
