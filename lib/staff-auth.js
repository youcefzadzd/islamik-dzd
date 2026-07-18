/**
 * مصادقة لوحة الإدارة — مالك أو عامل (server only).
 *
 * المالك: header x-owner-password ضد OWNER_PASSWORD (كل الصلاحيات).
 * العامل: headers x-staff-user + x-staff-password ضد جدول staff_users،
 * وتُفحص صلاحية القسم المطلوب من عمود permissions (jsonb).
 *
 * الاستعمال في المسارات:
 *   const auth = await authOwnerOrStaff(request, "orders");
 *   if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
 */
import { getAdminClient } from "./wedding-service";
import { safeEqual, verifyPassword } from "./passwords";

export const ALL_PERMISSIONS = [
  "weddings",
  "orders",
  "media",
  "music",
  "templates",
  "analytics",
  "settings",
];

const OWNER_PERMISSIONS = Object.fromEntries(ALL_PERMISSIONS.map((p) => [p, true]));

export async function authOwnerOrStaff(request, requiredPerm = null) {
  if (!process.env.OWNER_PASSWORD) {
    return { error: "OWNER_PASSWORD is not set on the server", status: 503 };
  }

  const ownerPass = request.headers.get("x-owner-password") || "";
  if (ownerPass && safeEqual(ownerPass, process.env.OWNER_PASSWORD)) {
    return { role: "owner", displayName: "Propriétaire", permissions: OWNER_PERMISSIONS };
  }

  const username = (request.headers.get("x-staff-user") || "").trim().toLowerCase();
  const staffPass = request.headers.get("x-staff-password") || "";
  if (!username || !staffPass) return { error: "unauthorized", status: 401 };

  const supabase = getAdminClient();
  if (!supabase) return { error: "supabase not configured", status: 503 };

  const { data } = await supabase
    .from("staff_users")
    .select("id, username, display_name, password_hash, permissions, active")
    .eq("username", username)
    .maybeSingle();

  if (!data || !data.active || !verifyPassword(staffPass, data.password_hash)) {
    return { error: "unauthorized", status: 401 };
  }

  const permissions = data.permissions && typeof data.permissions === "object" ? data.permissions : {};
  if (requiredPerm && !permissions[requiredPerm]) {
    return { error: "forbidden", status: 403 };
  }

  return {
    role: "staff",
    staffId: data.id,
    displayName: data.display_name || data.username,
    permissions,
  };
}
