import { NextResponse } from "next/server";
import {
  getAdminClient,
  generateWeddingId,
  normalizeRsvpSettings,
} from "@/lib/wedding-service";
import { hashPassword } from "@/lib/passwords";
import { authOwnerOrStaff } from "@/lib/staff-auth";

/**
 * تأكيد استمارة العميل بضغطة واحدة — POST { id: orderId }
 * ينشئ العرس إن لم يوجد، يطبّق كل حقول الاستمارة عليه (الأسماء
 * بالفرنسية والعربية، صاحب الدعوة، الوالدان، التاريخ والساعة،
 * القاعة والعنوان والخريطة، إعدادات المرافقين، الهاتف)، ثم يعلّم
 * الطلب Infos complètes. المالك يعدّل التفاصيل لاحقًا من «Modifier».
 */

const cap = (s) =>
  typeof s === "string" && s.trim()
    ? s
        .trim()
        .toLowerCase()
        .replace(/(^|[\s\-'’])(\p{L})/gu, (m, sep, ch) => sep + ch.toUpperCase())
    : "";

export async function POST(request) {
  const auth = await authOwnerOrStaff(request, "orders");
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "supabase not configured" }, { status: 503 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const id = String(body.id || "").trim();
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

  const { data: order, error: orderErr } = await supabase
    .from("site_orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (orderErr) return NextResponse.json({ error: orderErr.message }, { status: 500 });
  if (!order) return NextResponse.json({ error: "order not found" }, { status: 404 });
  const ci = order.client_info;
  if (!ci) return NextResponse.json({ error: "no client fiche on this order" }, { status: 400 });

  const groom = cap(ci.groomFr) || order.groom_name;
  const bride = cap(ci.brideFr) || order.bride_name;

  /* العرس الحالي إن وُجد — وإلا نجهّز إنشاءه */
  let wedding = null;
  if (order.wedding_id) {
    const { data } = await supabase
      .from("weddings")
      .select("*")
      .eq("wedding_id", order.wedding_id)
      .maybeSingle();
    wedding = data || null;
  }

  const texts = (wedding && wedding.texts) || {};
  const invitation = texts.invitation || {};
  const mergedTexts = {
    ...texts,
    couple: {
      ...(texts.couple || {}),
      ...(ci.groomAr ? { groomNameAr: ci.groomAr } : {}),
      ...(ci.brideAr ? { brideNameAr: ci.brideAr } : {}),
    },
    invitation: {
      ...invitation,
      honoreeGender: ci.honoree === "bride" ? "female" : "male",
      ar: {
        ...(invitation.ar || {}),
        ...(ci.father ? { fatherName: ci.father } : {}),
        ...(ci.mother ? { motherName: ci.mother } : {}),
      },
      fr: {
        ...(invitation.fr || {}),
        ...(ci.father ? { fatherName: ci.father } : {}),
        ...(ci.mother ? { motherName: ci.mother } : {}),
      },
    },
  };

  const rsvpSettings = normalizeRsvpSettings({
    allow_companions: ci.rsvpCompanions !== "non",
    max_adult_companions: parseInt(ci.rsvpMax, 10) || 2,
    children_allowed: ci.rsvpChildren === "oui",
    max_children: ci.rsvpChildren === "oui" ? 2 : 0,
  });

  const fields = {
    groom_name: groom,
    bride_name: bride,
    display_name: `${groom} & ${bride}`,
    wedding_date: ci.date || order.wedding_date || (wedding ? wedding.wedding_date : null),
    wedding_time: ci.time || (wedding ? wedding.wedding_time : null),
    location_name: ci.venue || order.venue || (wedding ? wedding.location_name : null),
    address: ci.address || (wedding ? wedding.address : null),
    google_maps_url: ci.maps || (wedding ? wedding.google_maps_url : null),
    default_language: (ci.lang || order.lang) === "ar" ? "ar" : "fr",
    texts: mergedTexts,
    rsvp_settings: rsvpSettings,
    contact: {
      ...((wedding && wedding.contact) || {}),
      phone: ci.phone || order.phone,
    },
  };

  let weddingId = order.wedding_id;
  let dashboardPassword = null;

  if (wedding) {
    const { error } = await supabase
      .from("weddings")
      .update(fields)
      .eq("wedding_id", weddingId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    /* إنشاء العرس من الاستمارة مباشرة */
    weddingId = generateWeddingId();
    for (let i = 0; i < 3; i++) {
      const { data } = await supabase
        .from("weddings")
        .select("id")
        .eq("wedding_id", weddingId)
        .maybeSingle();
      if (!data) break;
      weddingId = generateWeddingId();
    }
    dashboardPassword = Math.random().toString(36).slice(2, 10);
    const { error } = await supabase.from("weddings").insert({
      wedding_id: weddingId,
      initials: `${(groom[0] || "").toUpperCase()}.${(bride[0] || "").toUpperCase()}`,
      languages: ["fr", "ar"],
      program: [],
      theme: { template: order.template_id || ci.template || "islamic-royal" },
      media: {},
      dashboard_password_hash: hashPassword(dashboardPassword),
      ...fields,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  /* الطلب: مرتبط بالعرس، معلوماته مكتملة، وينتقل للتحضير إن كان جديدًا */
  const orderUpdate = {
    wedding_id: weddingId,
    infos_complete: true,
    ...(order.status === "new" ? { status: "preparing" } : {}),
    ...(dashboardPassword ? { dashboard_password: dashboardPassword } : {}),
  };
  const { data: savedOrder, error: updErr } = await supabase
    .from("site_orders")
    .update(orderUpdate)
    .eq("id", id)
    .select("*")
    .single();
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, order: savedOrder, weddingId });
}
