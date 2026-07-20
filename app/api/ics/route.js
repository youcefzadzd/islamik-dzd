/**
 * ملف تقويم عالمي (.ics): يفتح في تقويم Apple على آيفون وفي تقويم
 * Google/Samsung على أندرويد — الرابط الموحّد الذي تستعمله أزرار
 * «أضف الموعد إلى تقويمك» في القوالب.
 *   /api/ics?title=..&start=ISO&end=ISO&location=..
 */
export const dynamic = "force-dynamic";

const fmt = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
// تهريب فواصل ICS القياسية
const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

export async function GET(request) {
  const p = new URL(request.url).searchParams;
  const title = p.get("title") || "Mariage";
  const startIso = p.get("start");
  const location = p.get("location") || "";
  const start = startIso ? new Date(startIso) : null;
  if (!start || Number.isNaN(start.getTime())) {
    return new Response("missing/invalid start", { status: 400 });
  }
  const endIso = p.get("end");
  const end =
    endIso && !Number.isNaN(new Date(endIso).getTime())
      ? new Date(endIso)
      : new Date(start.getTime() + 4 * 3600 * 1000);

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Dawati//Wedding Invitation//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${start.getTime()}-${encodeURIComponent(title).slice(0, 24)}@dawati-dz.com`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${esc(title)}`,
    location ? `LOCATION:${esc(location)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  return new Response(ics, {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": 'attachment; filename="mariage.ics"',
      "cache-control": "no-store",
    },
  });
}
