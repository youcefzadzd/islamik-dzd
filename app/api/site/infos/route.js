import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/wedding-service";

/**
 * استقبال استمارة معلومات العرس من /infos — إدراج مباشر في
 * client_infos لتظهر فورًا في لوحة التحكم ← Fiches.
 * لا مصادقة (الصفحة عامة كصفحة الطلب) — تحقق صارم من الحقول
 * وقصّ للأطوال بدل الرفض.
 */

const s = (v, max = 200) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

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
  const row = {
    groom_name: groom,
    groom_name_ar: s(body.groomAr, 80) || null,
    bride_name: bride,
    bride_name_ar: s(body.brideAr, 80) || null,
    honoree: body.honoree === "bride" ? "bride" : "groom",
    father_name: s(body.father, 80) || null,
    mother_name: s(body.mother, 80) || null,
    wedding_date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null,
    wedding_time: s(body.time, 5) || null,
    venue: s(body.venue, 120) || null,
    address: s(body.address, 200) || null,
    maps_url: s(body.maps, 300) || null,
    template_id: s(body.template, 40) || null,
    pack_id: s(body.pack, 40) || null,
    program: s(body.program, 2000) || null,
    notes: s(body.notes, 2000) || null,
    phone,
    lang: body.lang === "fr" ? "fr" : "ar",
  };

  const { error } = await supabase.from("client_infos").insert(row);
  if (error) {
    /* الجدول غير منشأ بعد (migration لم تُنفَّذ) أو خطأ آخر —
       الواجهة تتحول تلقائيًا إلى إرسال واتساب */
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
