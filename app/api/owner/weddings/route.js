import { NextResponse } from "next/server";
import {
  getAdminClient,
  generateWeddingId,
  sanitizeWedding,
  normalizeRsvpSettings,
} from "@/lib/wedding-service";
import { hashPassword } from "@/lib/passwords";
import { authOwnerOrStaff } from "@/lib/staff-auth";

/* مالك، أو عامل يملك صلاحية «weddings» */
async function guard(request) {
  const auth = await authOwnerOrStaff(request, "weddings");
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  return null;
}

/* GET /api/owner/weddings — list all weddings */
export async function GET(request) {
  const denied = await guard(request);
  if (denied) return denied;
  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "supabase not configured" }, { status: 503 });
  }
  const { data, error } = await supabase
    .from("weddings")
    .select(
      "id, wedding_id, bride_name, groom_name, display_name, wedding_date, created_at, default_language, languages, media, texts"
    )
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    rows: data.map(({ texts, media, ...w }) => ({
      ...w,
      heroImage: media?.heroImage || null,
      archived: !!texts?._archived,
    })),
  });
}

/* POST /api/owner/weddings — create a wedding */
export async function POST(request) {
  const denied = await guard(request);
  if (denied) return denied;
  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "supabase not configured" }, { status: 503 });
  }

  const body = await request.json();
  if (!body.groomName || !body.brideName || !body.dashboardPassword) {
    return NextResponse.json(
      { error: "groomName, brideName and dashboardPassword are required" },
      { status: 400 }
    );
  }

  // unique WED-XXXXXX (retry on the astronomically unlikely collision)
  let weddingId = generateWeddingId();
  for (let i = 0; i < 3; i++) {
    const { data } = await supabase
      .from("weddings")
      .select("id")
      .eq("wedding_id", weddingId)
      .maybeSingle();
    if (!data) break;
    weddingId = generateWeddingId();
  }

  const row = {
    wedding_id: weddingId,
    groom_name: body.groomName,
    bride_name: body.brideName,
    display_name: body.displayName || `${body.groomName} & ${body.brideName}`,
    initials: body.initials || `${body.groomName[0] || ""}.${body.brideName[0] || ""}`,
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
    rsvp_settings: normalizeRsvpSettings(body.rsvpSettings),
    dashboard_password_hash: hashPassword(body.dashboardPassword),
  };

  const { data, error } = await supabase.from("weddings").insert(row).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    wedding: sanitizeWedding(data),
    links: {
      invitation: `/w/${weddingId}`,
      dashboard: `/dashboard/${weddingId}`,
    },
    dashboardPassword: body.dashboardPassword,
  });
}
