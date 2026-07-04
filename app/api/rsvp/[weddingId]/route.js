import { NextResponse } from "next/server";
import config from "@/wedding-config.json";
import { getAdminClient, getWeddingByPublicId } from "@/lib/wedding-service";
import { verifyPassword, safeEqual } from "@/lib/passwords";

/**
 * Client dashboard API — server only.
 * Password check order:
 *   1. platform wedding row → scrypt hash (dashboard_password_hash)
 *   2. template/demo wedding → DASHBOARD_PASSWORD env, then
 *      wedding-config.json admin.password (local fallback)
 * Every query is filtered by the URL's wedding_id.
 */
async function authorize(request, weddingId) {
  const given = request.headers.get("x-dashboard-password") || "";
  if (!given) return false;

  const { configured, wedding } = await getWeddingByPublicId(weddingId);
  if (configured && wedding) {
    return verifyPassword(given, wedding.dashboard_password_hash);
  }
  // template/demo wedding
  const expected = process.env.DASHBOARD_PASSWORD || config.admin?.password || "";
  return safeEqual(given, expected);
}

export async function GET(request, { params }) {
  const { weddingId } = await params;
  if (!(await authorize(request, weddingId))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "supabase not configured" }, { status: 503 });
  }
  const { data, error } = await supabase
    .from("rsvp_responses")
    .select("*")
    .eq("wedding_id", weddingId)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rows: data });
}

export async function DELETE(request, { params }) {
  const { weddingId } = await params;
  if (!(await authorize(request, weddingId))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "supabase not configured" }, { status: 503 });
  }
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  const { error } = await supabase
    .from("rsvp_responses")
    .delete()
    .eq("id", id)
    .eq("wedding_id", weddingId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
