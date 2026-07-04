import { NextResponse } from "next/server";
import { getAdminClient, sanitizeWedding } from "@/lib/wedding-service";
import { hashPassword, safeEqual } from "@/lib/passwords";

function guard(request) {
  if (!process.env.OWNER_PASSWORD) {
    return NextResponse.json(
      { error: "OWNER_PASSWORD is not set on the server" },
      { status: 503 }
    );
  }
  const given = request.headers.get("x-owner-password") || "";
  if (!safeEqual(given, process.env.OWNER_PASSWORD)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}

/* GET one wedding (without the password hash) */
export async function GET(request, { params }) {
  const denied = guard(request);
  if (denied) return denied;
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "supabase not configured" }, { status: 503 });
  const { weddingId } = await params;
  const { data, error } = await supabase
    .from("weddings")
    .select("*")
    .eq("wedding_id", weddingId)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ wedding: sanitizeWedding(data) });
}

/* PUT — update a wedding; dashboardPassword (if given) is re-hashed */
export async function PUT(request, { params }) {
  const denied = guard(request);
  if (denied) return denied;
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "supabase not configured" }, { status: 503 });
  const { weddingId } = await params;
  const body = await request.json();

  const patch = {
    groom_name: body.groomName,
    bride_name: body.brideName,
    display_name: body.displayName || `${body.groomName} & ${body.brideName}`,
    initials: body.initials,
    wedding_date: body.weddingDate || null,
    wedding_time: body.weddingTime || null,
    rsvp_deadline: body.rsvpDeadline || null,
    location_name: body.locationName || null,
    address: body.address || null,
    google_maps_url: body.googleMapsUrl || null,
    default_language: body.defaultLanguage === "ar" ? "ar" : "fr",
    languages: Array.isArray(body.languages) && body.languages.length ? body.languages : ["fr", "ar"],
    program: Array.isArray(body.program) ? body.program : [],
    theme: body.theme || {},
    texts: body.texts || {},
    media: body.media || {},
    contact: body.contact || {},
  };
  if (body.dashboardPassword) {
    patch.dashboard_password_hash = hashPassword(body.dashboardPassword);
  }

  const { data, error } = await supabase
    .from("weddings")
    .update(patch)
    .eq("wedding_id", weddingId)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ wedding: sanitizeWedding(data) });
}

/* DELETE — remove the wedding and all of its RSVP responses */
export async function DELETE(request, { params }) {
  const denied = guard(request);
  if (denied) return denied;
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "supabase not configured" }, { status: 503 });
  const { weddingId } = await params;
  await supabase.from("rsvp_responses").delete().eq("wedding_id", weddingId);
  const { error } = await supabase.from("weddings").delete().eq("wedding_id", weddingId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
