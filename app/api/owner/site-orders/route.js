import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/wedding-service";
import { safeEqual } from "@/lib/passwords";
import { CATALOG, PRICING } from "@/components/site/site-config";

/**
 * طلبات موقع البيع في لوحة المالك (server only).
 * GET   → قائمة الطلبات (الأحدث أولًا)
 * PATCH → تعديل طلب: الحالة و/أو أي حقل من حقول الطلب { id, ...fields }
 */

const STATUSES = new Set(["new", "contacted", "preparing", "done", "cancelled"]);
const TEMPLATE_IDS = new Set(CATALOG.filter((c) => !c.comingSoon).map((c) => c.id));
const PACK_IDS = new Set(PRICING.map((p) => p.id));

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
    .from("site_orders")
    .select("id, created_at, groom_name, bride_name, wedding_date, venue, phone, template_id, pack_id, lang, status, wedding_id")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    const missing =
      error.message.includes("site_orders") &&
      /does not exist|schema cache|could not find/i.test(error.message);
    return NextResponse.json(
      { error: missing ? "site_orders table missing — run site-orders-migration.sql" : error.message },
      { status: missing ? 503 : 500 }
    );
  }
  return NextResponse.json({ orders: data });
}

export async function PATCH(request) {
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
  const id = String(body.id || "").trim();
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

  /* يُبنى التحديث من الحقول المُرسلة فقط — كل حقل يُتحقق منه على حدة */
  const update = {};

  if (body.status !== undefined) {
    const status = String(body.status).trim();
    if (!STATUSES.has(status)) return NextResponse.json({ error: "invalid status" }, { status: 400 });
    update.status = status;
  }
  for (const [key, col] of [["groomName", "groom_name"], ["brideName", "bride_name"]]) {
    if (body[key] !== undefined) {
      const v = String(body[key]).trim();
      if (v.length < 2 || v.length > 60) {
        return NextResponse.json({ error: `invalid ${col}` }, { status: 400 });
      }
      update[col] = v;
    }
  }
  if (body.phone !== undefined) {
    const phone = String(body.phone).trim();
    const digits = phone.replace(/\D/g, "");
    if (!/^[0-9+\s()-]{8,24}$/.test(phone) || digits.length < 8 || digits.length > 15) {
      return NextResponse.json({ error: "invalid phone" }, { status: 400 });
    }
    update.phone = phone;
  }
  if (body.weddingDate !== undefined) {
    const d = String(body.weddingDate || "").trim();
    if (d && (!/^\d{4}-\d{2}-\d{2}$/.test(d) || isNaN(Date.parse(d)))) {
      return NextResponse.json({ error: "invalid wedding date" }, { status: 400 });
    }
    update.wedding_date = d || null;
  }
  if (body.venue !== undefined) {
    const v = String(body.venue).trim();
    if (v.length > 160) return NextResponse.json({ error: "invalid venue" }, { status: 400 });
    update.venue = v || null;
  }
  if (body.templateId !== undefined) {
    const t = String(body.templateId).trim();
    if (t && !TEMPLATE_IDS.has(t)) return NextResponse.json({ error: "invalid template" }, { status: 400 });
    update.template_id = t || null;
  }
  if (body.packId !== undefined) {
    const p = String(body.packId).trim();
    if (p && !PACK_IDS.has(p)) return NextResponse.json({ error: "invalid pack" }, { status: 400 });
    update.pack_id = p || null;
  }
  if (body.weddingId !== undefined) {
    const w = String(body.weddingId).trim();
    if (w && !/^WED-[A-Z0-9]{4,12}$/i.test(w)) {
      return NextResponse.json({ error: "invalid wedding id" }, { status: 400 });
    }
    update.wedding_id = w || null;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("site_orders")
    .update(update)
    .eq("id", id)
    .select("id, created_at, groom_name, bride_name, wedding_date, venue, phone, template_id, pack_id, lang, status, wedding_id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, order: data });
}
