import { NextResponse } from "next/server";
import { authOwnerOrStaff } from "@/lib/staff-auth";

/**
 * تحقق الدخول للوحة الإدارة — مالك أو عامل.
 * يقرأ نفس ترويسات المصادقة ويرجع الدور والصلاحيات واسم العرض،
 * فتستعمله البوابة للتحقق وبناء القائمة الجانبية حسب الصلاحيات.
 */
export async function GET(request) {
  const auth = await authOwnerOrStaff(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  return NextResponse.json({
    role: auth.role,
    displayName: auth.displayName,
    permissions: auth.permissions,
  });
}
