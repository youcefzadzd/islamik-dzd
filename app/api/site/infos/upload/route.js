import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/wedding-service";

/**
 * رفع صور استمارة العميل (/infos — باقتا Premium وRoyale).
 * عام كالاستمارة نفسها، مع حدود صارمة: صور فقط، ≤ 8MB.
 * تُخزَّن في wedding-images تحت client-photos/ ويعود الرابط العام
 * ليُحفظ ضمن client_info.photos ثم يلتحق بمعرض العرس عند التأكيد.
 */

const IMAGE_BUCKET = "wedding-images";
const OK_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(request) {
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "not configured" }, { status: 503 });

  let form;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "invalid form data" }, { status: 400 });
  }
  const file = form.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "missing file" }, { status: 400 });
  }
  const ext = OK_TYPES[file.type];
  if (!ext) return NextResponse.json({ error: "images only" }, { status: 400 });
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "file too large (max 8MB)" }, { status: 400 });
  }

  const { data: bucket } = await supabase.storage.getBucket(IMAGE_BUCKET);
  if (!bucket) {
    await supabase.storage.createBucket(IMAGE_BUCKET, { public: true, fileSizeLimit: "25MB" });
  }

  const name = `client-photos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(name, buffer, { contentType: file.type });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const url = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(name).data.publicUrl;
  return NextResponse.json({ ok: true, url });
}
