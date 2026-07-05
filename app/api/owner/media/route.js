import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/wedding-service";
import { safeEqual } from "@/lib/passwords";

/**
 * Owner media library on Supabase Storage (public bucket "media",
 * created automatically on first use). Server only — service key.
 */
const BUCKET = "media";

function denied(request) {
  if (!process.env.OWNER_PASSWORD) {
    return NextResponse.json({ error: "OWNER_PASSWORD is not set on the server" }, { status: 503 });
  }
  if (!safeEqual(request.headers.get("x-owner-password") || "", process.env.OWNER_PASSWORD)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}

async function ensureBucket(supabase) {
  const { data } = await supabase.storage.getBucket(BUCKET);
  if (!data) {
    await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: "20MB",
    });
  }
}

export async function GET(request) {
  const d = denied(request);
  if (d) return d;
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "supabase not configured" }, { status: 503 });
  await ensureBucket(supabase);
  const { data, error } = await supabase.storage.from(BUCKET).list("", {
    limit: 500,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const files = (data || [])
    .filter((f) => f.name && !f.name.startsWith("."))
    .map((f) => ({
      name: f.name,
      size: f.metadata?.size || 0,
      createdAt: f.created_at,
      url: supabase.storage.from(BUCKET).getPublicUrl(f.name).data.publicUrl,
    }));
  return NextResponse.json({ files });
}

export async function POST(request) {
  const d = denied(request);
  if (d) return d;
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "supabase not configured" }, { status: 503 });
  await ensureBucket(supabase);

  const form = await request.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "missing file" }, { status: 400 });
  }
  // replace mode keeps the exact name; normal uploads get a unique prefix
  const replaceName = form.get("replace");
  const safeName = (replaceName || `${Date.now().toString(36)}-${file.name}`)
    .toString()
    .replace(/[^a-zA-Z0-9._-]/g, "_");

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from(BUCKET).upload(safeName, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: true,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const url = supabase.storage.from(BUCKET).getPublicUrl(safeName).data.publicUrl;
  return NextResponse.json({ name: safeName, url });
}

export async function DELETE(request) {
  const d = denied(request);
  if (d) return d;
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "supabase not configured" }, { status: 503 });
  const { name } = await request.json();
  if (!name) return NextResponse.json({ error: "missing name" }, { status: 400 });
  const { error } = await supabase.storage.from(BUCKET).remove([name]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
