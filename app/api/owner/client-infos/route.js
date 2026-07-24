import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/wedding-service";
import { authOwnerOrStaff } from "@/lib/staff-auth";

/**
 * استمارات معلومات العرس في لوحة التحكم (server only).
 * GET → القائمة كاملة · PATCH → { id, status } · DELETE → { id }
 * الصلاحية: المالك أو عامل يملك «orders» (نفس فريق الطلبات).
 */

async function authError(request) {
  const auth = await authOwnerOrStaff(request, "orders");
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  return null;
}

export async function GET(request) {
  const denied = await authError(request);
  if (denied) return denied;
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "supabase not configured" }, { status: 503 });

  const { data, error } = await supabase
    .from("client_infos")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ infos: data || [] });
}

export async function PATCH(request) {
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
  const id = String(body.id || "");
  const status = body.status === "processed" ? "processed" : "new";
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

  const { error } = await supabase.from("client_infos").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request) {
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
  const id = String(body.id || "");
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

  const { error } = await supabase.from("client_infos").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
