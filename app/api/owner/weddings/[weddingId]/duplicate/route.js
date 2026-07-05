import { NextResponse } from "next/server";
import { getAdminClient, generateWeddingId, sanitizeWedding } from "@/lib/wedding-service";
import { safeEqual } from "@/lib/passwords";

/** POST — duplicate a wedding under a fresh WED-XXXXXX id */
export async function POST(request, { params }) {
  if (!process.env.OWNER_PASSWORD) {
    return NextResponse.json({ error: "OWNER_PASSWORD is not set on the server" }, { status: 503 });
  }
  if (!safeEqual(request.headers.get("x-owner-password") || "", process.env.OWNER_PASSWORD)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "supabase not configured" }, { status: 503 });

  const { weddingId } = await params;
  const { data: source, error } = await supabase
    .from("weddings")
    .select("*")
    .eq("wedding_id", weddingId)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!source) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { id, created_at, updated_at, ...rest } = source;
  const copy = {
    ...rest,
    wedding_id: generateWeddingId(),
    display_name: `${source.display_name || "Mariage"} (copie)`,
    // the copy keeps the same dashboard password hash; never archived
    texts: { ...(source.texts || {}), _archived: undefined },
  };
  const { data, error: insErr } = await supabase.from("weddings").insert(copy).select().single();
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
  return NextResponse.json({ wedding: sanitizeWedding(data) });
}
