import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/wedding-service";
import { safeEqual } from "@/lib/passwords";

/** aggregate data for the owner dashboard + analytics (server only) */
export async function GET(request) {
  if (!process.env.OWNER_PASSWORD) {
    return NextResponse.json({ error: "OWNER_PASSWORD is not set on the server" }, { status: 503 });
  }
  if (!safeEqual(request.headers.get("x-owner-password") || "", process.env.OWNER_PASSWORD)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "supabase not configured" }, { status: 503 });

  const [weddings, rsvps] = await Promise.all([
    supabase
      .from("weddings")
      .select("id, wedding_id, bride_name, groom_name, display_name, wedding_date, created_at, texts")
      .order("created_at", { ascending: false }),
    supabase
      .from("rsvp_responses")
      .select("wedding_id, guest_name, attendance_status, guest_count, language, created_at")
      .order("created_at", { ascending: false })
      .limit(2000),
  ]);
  if (weddings.error) return NextResponse.json({ error: weddings.error.message }, { status: 500 });
  if (rsvps.error) return NextResponse.json({ error: rsvps.error.message }, { status: 500 });

  return NextResponse.json({
    weddings: weddings.data.map(({ texts, ...w }) => ({ ...w, archived: !!texts?._archived })),
    rsvps: rsvps.data,
  });
}
