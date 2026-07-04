import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "crypto";
import config from "@/wedding-config.json";

/**
 * Dashboard API — runs only on the server.
 * Reads/deletes use the service-role key (never sent to the browser) and
 * are gated by the dashboard password. Guests never touch this route;
 * their inserts go straight to Supabase under the insert-only RLS policy.
 *
 * Password: DASHBOARD_PASSWORD env var wins; wedding-config.json
 * admin.password is the fallback for local use.
 */

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function passwordOk(request) {
  const expected = process.env.DASHBOARD_PASSWORD || config.admin?.password || "";
  const given = request.headers.get("x-dashboard-password") || "";
  if (!expected || !given) return false;
  const a = Buffer.from(String(expected));
  const b = Buffer.from(String(given));
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request, { params }) {
  const { weddingId } = await params;
  if (!passwordOk(request)) {
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
  if (!passwordOk(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "supabase not configured" }, { status: 503 });
  }
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  // scoped to the wedding in the URL: one client can never delete another's rows
  const { error } = await supabase
    .from("rsvp_responses")
    .delete()
    .eq("id", id)
    .eq("wedding_id", weddingId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
