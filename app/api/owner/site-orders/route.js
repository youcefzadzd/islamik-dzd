import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/wedding-service";
import { safeEqual } from "@/lib/passwords";

/**
 * طلبات موقع البيع في لوحة المالك (server only).
 * GET   → قائمة الطلبات (الأحدث أولًا)
 * PATCH → تغيير حالة طلب { id, status }
 */

const STATUSES = new Set(["new", "contacted", "done", "cancelled"]);

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
    .select("id, created_at, groom_name, bride_name, wedding_date, venue, phone, template_id, pack_id, lang, status")
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
  const status = String(body.status || "").trim();
  if (!id || !STATUSES.has(status)) {
    return NextResponse.json({ error: "invalid id or status" }, { status: 400 });
  }

  const { error } = await supabase.from("site_orders").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
