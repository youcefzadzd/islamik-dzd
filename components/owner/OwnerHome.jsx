"use client";

import { useEffect, useState } from "react";
import { OwnerGate, OwnerLayout, ownerHeaders, statusOf, daysUntil, OWNER_PASS_KEY } from "./shared";

function StatCard({ label, value, accent }) {
  return (
    <div className="lux-card px-3 py-5 text-center">
      <p className={`relative font-serif text-3xl ${accent || "text-burgundy"}`}>{value}</p>
      <p className="relative mt-1 text-[0.68rem] uppercase tracking-[0.15em] text-gold-dark">{label}</p>
    </div>
  );
}

function WeddingLine({ w, right }) {
  const s = statusOf(w);
  return (
    <a
      href={`/owner/weddings`}
      className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 hover:bg-ivory-dark"
    >
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-ink">
          {w.display_name || `${w.groom_name} & ${w.bride_name}`}
        </span>
        <span className="text-xs text-ink/50">{w.wedding_id}</span>
      </span>
      <span className="flex shrink-0 items-center gap-2">
        {right}
        <span className={`rounded-full px-2 py-0.5 text-[0.65rem] uppercase tracking-wider ${s.cls}`}>
          {s.label}
        </span>
      </span>
    </a>
  );
}

export default function OwnerHome() {
  const [granted, setGranted] = useState(false);
  const [rows, setRows] = useState(null);

  async function load() {
    const res = await fetch("/api/owner/weddings", { headers: ownerHeaders() });
    if (!res.ok) return setGranted(false);
    setGranted(true);
    setRows((await res.json()).rows);
  }

  useEffect(() => {
    if (sessionStorage.getItem(OWNER_PASS_KEY)) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!granted) {
    return (
      <OwnerGate
        onGranted={(json) => {
          setGranted(true);
          setRows(json.rows);
        }}
      />
    );
  }

  const all = rows || [];
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);
  const upcoming = all
    .filter((w) => w.wedding_date && w.wedding_date >= today)
    .sort((a, b) => a.wedding_date.localeCompare(b.wedding_date));
  const past = all.filter((w) => w.wedding_date && w.wedding_date < today);
  const thisMonth = all.filter((w) => (w.wedding_date || "").startsWith(month));
  const recent = [...all]
    .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""))
    .slice(0, 5);

  return (
    <OwnerLayout active="/owner" title="Tableau de bord">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Mariages" value={all.length} />
        <StatCard label="À venir" value={upcoming.length} accent="text-gold-dark" />
        <StatCard label="Ce mois-ci" value={thisMonth.length} accent="text-gold-dark" />
        <StatCard label="Passés" value={past.length} accent="text-ink/60" />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-gold/30 bg-ivory-light p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold text-ink">Prochains mariages</h2>
            <a href="/owner/weddings/new" className="text-sm text-burgundy hover:underline">
              + créer
            </a>
          </div>
          {upcoming.length === 0 && <p className="px-3 py-4 text-sm text-ink/55">Aucun mariage à venir.</p>}
          {upcoming.slice(0, 5).map((w) => (
            <WeddingLine
              key={w.id}
              w={w}
              right={
                <span className="text-xs text-gold-dark">
                  J-{daysUntil(w.wedding_date)}
                </span>
              }
            />
          ))}
        </section>

        <section className="rounded-2xl border border-gold/30 bg-ivory-light p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold text-ink">Créés récemment</h2>
            <a href="/owner/weddings" className="text-sm text-burgundy hover:underline">
              tout voir →
            </a>
          </div>
          {recent.length === 0 && <p className="px-3 py-4 text-sm text-ink/55">Aucun mariage.</p>}
          {recent.map((w) => (
            <WeddingLine
              key={w.id}
              w={w}
              right={
                <span className="text-xs text-ink/45">
                  {new Date(w.created_at).toLocaleDateString("fr-FR")}
                </span>
              }
            />
          ))}
        </section>
      </div>
    </OwnerLayout>
  );
}
