import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/wedding-service";
import { hashPassword } from "@/lib/passwords";
import { authOwnerOrStaff, ALL_PERMISSIONS } from "@/lib/staff-auth";

/**
 * إدارة حسابات العمال — للمالك فقط (server only).
 * GET    → قائمة العمال
 * POST   → إنشاء { email, displayName, password, permissions }
 * PATCH  → تعديل { id, displayName?, password?, permissions?, active? }
 * DELETE → حذف { id }
 */

async function ownerOnly(request) {
  const auth = await authOwnerOrStaff(request);
  if (auth.error) return { denied: NextResponse.json({ error: auth.error }, { status: auth.status }) };
  if (auth.role !== "owner") {
    return { denied: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  }
  return {};
}

function cleanPermissions(input) {
  const out = {};
  for (const key of ALL_PERMISSIONS) out[key] = Boolean(input?.[key]);
  return out;
}

const SELECT = "id, created_at, email, display_name, permissions, active, is_admin";

export async function GET(request) {
  const { denied } = await ownerOnly(request);
  if (denied) return denied;
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "supabase not configured" }, { status: 503 });

  const { data, error } = await supabase
    .from("staff_users")
    .select(SELECT)
    .order("created_at", { ascending: true });
  if (error) {
    const missing =
      error.message.includes("staff_users") &&
      /does not exist|schema cache|could not find/i.test(error.message);
    return NextResponse.json(
      { error: missing ? "staff_users table missing — run staff-users-migration.sql" : error.message },
      { status: missing ? 503 : 500 }
    );
  }
  return NextResponse.json({ staff: data });
}

export async function POST(request) {
  const { denied } = await ownerOnly(request);
  if (denied) return denied;
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "supabase not configured" }, { status: 503 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 80) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }
  if (password.length < 6 || password.length > 60) {
    return NextResponse.json({ error: "invalid password" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("staff_users")
    .insert({
      email,
      display_name: String(body.displayName || "").trim() || null,
      password_hash: hashPassword(password),
      permissions: cleanPermissions(body.permissions),
      is_admin: Boolean(body.isAdmin),
    })
    .select(SELECT)
    .single();
  if (error) {
    const duplicate = /duplicate|unique/i.test(error.message);
    return NextResponse.json(
      { error: duplicate ? "email already exists" : error.message },
      { status: duplicate ? 409 : 500 }
    );
  }
  return NextResponse.json({ staff: data });
}

export async function PATCH(request) {
  const { denied } = await ownerOnly(request);
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

  const update = {};
  if (body.displayName !== undefined) {
    update.display_name = String(body.displayName).trim() || null;
  }
  if (body.permissions !== undefined) {
    update.permissions = cleanPermissions(body.permissions);
  }
  if (body.active !== undefined) {
    update.active = Boolean(body.active);
  }
  if (body.isAdmin !== undefined) {
    update.is_admin = Boolean(body.isAdmin);
  }
  if (body.password !== undefined && body.password !== "") {
    const password = String(body.password);
    if (password.length < 6 || password.length > 60) {
      return NextResponse.json({ error: "invalid password" }, { status: 400 });
    }
    update.password_hash = hashPassword(password);
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("staff_users")
    .update(update)
    .eq("id", id)
    .select(SELECT)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ staff: data });
}

export async function DELETE(request) {
  const { denied } = await ownerOnly(request);
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

  const { error } = await supabase.from("staff_users").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
