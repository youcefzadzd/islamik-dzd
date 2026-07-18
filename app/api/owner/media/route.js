import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/wedding-service";
import { authOwnerOrStaff } from "@/lib/staff-auth";

/**
 * Owner uploads on Supabase Storage — server only (service key).
 * Two public buckets, created automatically on first use:
 *   wedding-images — hero, thank-you, gallery photos
 *   wedding-music  — background music, opening sounds
 * ("media" is the legacy bucket: still listed if it has files.)
 */
const IMAGE_BUCKET = "wedding-images";
const MUSIC_BUCKET = "wedding-music";
const LEGACY_BUCKET = "media";

const AUDIO_RE = /^audio\/|\.(mp3|wav|ogg|m4a)$/i;

function bucketFor(fileName, mimeType) {
  return AUDIO_RE.test(mimeType || "") || AUDIO_RE.test(fileName || "")
    ? MUSIC_BUCKET
    : IMAGE_BUCKET;
}

/* مالك، أو عامل يملك صلاحية «media» */
async function denied(request) {
  const auth = await authOwnerOrStaff(request, "media");
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  return null;
}

async function ensureBucket(supabase, bucket) {
  const { data } = await supabase.storage.getBucket(bucket);
  if (!data) {
    await supabase.storage.createBucket(bucket, { public: true, fileSizeLimit: "25MB" });
  }
}

export async function GET(request) {
  const d = await denied(request);
  if (d) return d;
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "supabase not configured" }, { status: 503 });
  await Promise.all([ensureBucket(supabase, IMAGE_BUCKET), ensureBucket(supabase, MUSIC_BUCKET)]);

  const files = [];
  for (const bucket of [IMAGE_BUCKET, MUSIC_BUCKET, LEGACY_BUCKET]) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list("", { limit: 500, sortBy: { column: "created_at", order: "desc" } });
    if (error) continue; // legacy bucket may not exist — fine
    for (const f of data || []) {
      if (!f.name || f.name.startsWith(".")) continue;
      files.push({
        bucket,
        name: f.name,
        size: f.metadata?.size || 0,
        createdAt: f.created_at,
        url: supabase.storage.from(bucket).getPublicUrl(f.name).data.publicUrl,
      });
    }
  }
  files.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  return NextResponse.json({ files });
}

export async function POST(request) {
  const d = await denied(request);
  if (d) return d;
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "supabase not configured" }, { status: 503 });

  const form = await request.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "missing file" }, { status: 400 });
  }

  const replaceName = form.get("replace");
  const bucket = form.get("bucket") || bucketFor(file.name, file.type);
  await ensureBucket(supabase, bucket);

  const safeName = (replaceName || `${Date.now().toString(36)}-${file.name}`)
    .toString()
    .replace(/[^a-zA-Z0-9._-]/g, "_");

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from(bucket).upload(safeName, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: true,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const url = supabase.storage.from(bucket).getPublicUrl(safeName).data.publicUrl;
  return NextResponse.json({ bucket, name: safeName, url });
}

export async function DELETE(request) {
  const d = await denied(request);
  if (d) return d;
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "supabase not configured" }, { status: 503 });
  const { name, bucket } = await request.json();
  if (!name) return NextResponse.json({ error: "missing name" }, { status: 400 });
  const target = bucket || bucketFor(name, "");
  const { error } = await supabase.storage.from(target).remove([name]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
