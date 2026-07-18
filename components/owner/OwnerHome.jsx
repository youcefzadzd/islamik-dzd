"use client";

import { useEffect, useState } from "react";
import {
  OwnerGate,
  OwnerLayout,
  ownerHeaders,
  statusOf,
  daysUntil,
  glass,
  OWNER_PASS_KEY,
} from "./shared";

function StatCard({ label, value, hint }) {
  return (
    <div className={`px-3 py-5 text-center ${glass}`}>
      <p className="font-serif text-3xl text-stone-700">{value}</p>
      <p className="mt-1 text-[0.66rem] uppercase tracking-[0.15em] text-gold-dark">{label}</p>
      {hint && <p className="mt-0.5 text-[0.62rem] text-ink/40">{hint}</p>}
    </div>
  );
}

export default function OwnerHome() {
  const [granted, setGranted] = useState(false);
  const [stats, setStats] = useState(null);

  async function load() {
    const res = await fetch("/api/owner/stats", { headers: ownerHeaders() });
    if (!res.ok) return setGranted(false);
    setGranted(true);
    setStats(await res.json());
  }

  useEffect(() => {
    if (sessionStorage.getItem(OWNER_PASS_KEY)) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!granted) return <OwnerGate onGranted={() => load()} />;

  const weddings = stats?.weddings || [];
  const rsvps = stats?.rsvps || [];
  const today = new Date().toISOString().slice(0, 10);
  const active = weddings.filter((w) => !w.archived);
  const upcoming = active
    .filter((w) => w.wedding_date && w.wedding_date >= today)
    .sort((a, b) => a.wedding_date.localeCompare(b.wedding_date));
  const totalGuests = rsvps
    .filter((r) => r.attendance_status === "yes")
    .reduce((s, r) => s + (r.guest_count || 0), 0);

  // recent activity: created weddings + received RSVPs, merged
  const activity = [
    ...weddings.slice(0, 8).map((w) => ({
      at: w.created_at,
      icon: "💍",
      text: `Mariage créé : ${w.display_name || `${w.groom_name} & ${w.bride_name}`}`,
      sub: w.wedding_id,
    })),
    ...rsvps.slice(0, 8).map((r) => ({
      at: r.created_at,
      icon: r.attendance_status === "yes" ? "✅" : "❌",
      text: `RSVP de ${r.guest_name}${
        r.attendance_status === "yes" ? ` · ${r.guest_count} pers.` : " · absent"
      }`,
      sub: r.wedding_id,
    })),
  ]
    .sort((a, b) => (b.at || "").localeCompare(a.at || ""))
    .slice(0, 8);

  return (
    <OwnerLayout active="/owner" title="Dashboard">
      {!stats && <p className="py-10 text-center text-ink/55">Chargement…</p>}
      {stats && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard label="Mariages" value={weddings.length} />
            <StatCard label="Invitations actives" value={active.length} />
            <StatCard label="Réponses RSVP" value={rsvps.length} />
            <StatCard label="Invités confirmés" value={totalGuests} />
            <StatCard label="À venir" value={upcoming.length} />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <section className={`p-4 ${glass}`}>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-semibold text-ink">Activité récente</h2>
                <a href="/owner/analytics" className="text-sm text-stone-700 hover:underline">
                  statistiques →
                </a>
              </div>
              {activity.length === 0 && (
                <p className="px-2 py-4 text-sm text-ink/55">Aucune activité pour le moment.</p>
              )}
              <ul className="divide-y divide-gold/15">
                {activity.map((a, i) => (
                  <li key={i} className="flex items-center gap-3 px-1 py-2">
                    <span>{a.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-ink">{a.text}</span>
                      <span className="text-xs text-ink/45">{a.sub}</span>
                    </span>
                    <span className="shrink-0 text-xs text-ink/40">
                      {a.at ? new Date(a.at).toLocaleDateString("fr-FR") : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className={`p-4 ${glass}`}>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-semibold text-ink">Prochains mariages</h2>
                <a href="/owner/weddings" className="text-sm text-stone-700 hover:underline">
                  tout voir →
                </a>
              </div>
              {upcoming.length === 0 && (
                <p className="px-2 py-4 text-sm text-ink/55">Aucun mariage à venir.</p>
              )}
              <ul className="divide-y divide-gold/15">
                {upcoming.slice(0, 6).map((w) => {
                  const s = statusOf(w);
                  return (
                    <li key={w.id} className="flex items-center justify-between gap-2 px-1 py-2">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-ink">
                          {w.display_name || `${w.groom_name} & ${w.bride_name}`}
                        </span>
                        <span className="text-xs text-ink/45">
                          {w.wedding_id} · {w.wedding_date}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="text-xs font-semibold text-gold-dark">
                          J-{daysUntil(w.wedding_date)}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[0.62rem] uppercase tracking-wider ${s.cls}`}
                        >
                          {s.label}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </>
      )}
    </OwnerLayout>
  );
}
