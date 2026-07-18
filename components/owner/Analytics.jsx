"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AccessDenied,
  OwnerGate,
  OwnerLayout,
  ownerHeaders,
  glass,
  hasStoredCredentials,
} from "./shared";

/* last N months as ["2026-02", ...] with fr labels */
function lastMonths(n) {
  const out = [];
  const d = new Date();
  d.setDate(1);
  for (let i = n - 1; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
    out.push({
      key: `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`,
      label: m.toLocaleDateString("fr-FR", { month: "short" }),
    });
  }
  return out;
}

/* simple luxury bar chart in pure SVG */
function BarChart({ series, color = "#7B1E2B" }) {
  const max = Math.max(1, ...series.map((s) => s.value));
  const bw = 100 / series.length;
  return (
    <svg viewBox="0 0 100 58" className="w-full">
      {series.map((s, i) => {
        const h = (s.value / max) * 40;
        return (
          <g key={s.label + i}>
            <rect
              x={i * bw + bw * 0.2}
              y={46 - h}
              width={bw * 0.6}
              height={h}
              rx="1.5"
              fill={color}
              opacity="0.85"
            />
            <text x={i * bw + bw / 2} y={52} textAnchor="middle" fontSize="3.4" fill="#5A4636" opacity="0.6">
              {s.label}
            </text>
            {s.value > 0 && (
              <text x={i * bw + bw / 2} y={44 - h} textAnchor="middle" fontSize="3.6" fill="#5A4636">
                {s.value}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* donut for yes/no */
function Donut({ yes, no }) {
  const total = yes + no || 1;
  const yesFrac = yes / total;
  const C = 2 * Math.PI * 15.9;
  return (
    <div className="flex items-center justify-center gap-5">
      <svg viewBox="0 0 42 42" className="h-32 w-32">
        <circle cx="21" cy="21" r="15.9" fill="none" stroke="#EFE4D6" strokeWidth="5" />
        <circle
          cx="21"
          cy="21"
          r="15.9"
          fill="none"
          stroke="#C6A15B"
          strokeWidth="5"
          strokeDasharray={`${yesFrac * C} ${C}`}
          strokeLinecap="round"
          transform="rotate(-90 21 21)"
        />
        <text x="21" y="20" textAnchor="middle" fontSize="7" fill="#5A4636" fontWeight="600">
          {Math.round(yesFrac * 100)}%
        </text>
        <text x="21" y="27" textAnchor="middle" fontSize="3.2" fill="#5A4636" opacity="0.6">
          présents
        </text>
      </svg>
      <ul className="space-y-1 text-sm">
        <li className="flex items-center gap-2 text-ink/80">
          <span className="h-3 w-3 rounded-full bg-gold" /> Présents : {yes}
        </li>
        <li className="flex items-center gap-2 text-ink/80">
          <span className="h-3 w-3 rounded-full bg-ivory-dark" /> Absents : {no}
        </li>
      </ul>
    </div>
  );
}

export default function Analytics() {
  const [granted, setGranted] = useState(false);
  const [denied, setDenied] = useState(false);
  const [stats, setStats] = useState(null);

  async function load() {
    const res = await fetch("/api/owner/stats", { headers: ownerHeaders() });
    if (res.status === 403) {
      setGranted(true);
      return setDenied(true);
    }
    if (!res.ok) return setGranted(false);
    setGranted(true);
    setStats(await res.json());
  }

  useEffect(() => {
    if (hasStoredCredentials()) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const computed = useMemo(() => {
    if (!stats) return null;
    const months = lastMonths(6);
    const byMonth = (rows, dateKey) =>
      months.map((m) => ({
        label: m.label,
        value: rows.filter((r) => (r[dateKey] || "").startsWith(m.key)).length,
      }));
    const guestsByMonth = months.map((m) => ({
      label: m.label,
      value: stats.rsvps
        .filter((r) => (r.created_at || "").startsWith(m.key) && r.attendance_status === "yes")
        .reduce((s, r) => s + (r.guest_count || 0), 0),
    }));
    const yes = stats.rsvps.filter((r) => r.attendance_status === "yes").length;
    const no = stats.rsvps.filter((r) => r.attendance_status === "no").length;
    const totalGuests = stats.rsvps
      .filter((r) => r.attendance_status === "yes")
      .reduce((s, r) => s + (r.guest_count || 0), 0);
    return {
      weddingsByMonth: byMonth(stats.weddings, "created_at"),
      rsvpsByMonth: byMonth(stats.rsvps, "created_at"),
      guestsByMonth,
      yes,
      no,
      totalGuests,
    };
  }, [stats]);

  if (!granted) return <OwnerGate onGranted={() => load()} />;
  if (denied) return <AccessDenied />;

  return (
    <OwnerLayout active="/owner/analytics" title="Statistiques">
      {!computed && <p className="py-10 text-center text-ink/55">Chargement…</p>}
      {computed && (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className={`p-4 ${glass}`}>
            <h2 className="mb-2 font-semibold text-ink">Mariages créés — 6 derniers mois</h2>
            <BarChart series={computed.weddingsByMonth} />
          </section>
          <section className={`p-4 ${glass}`}>
            <h2 className="mb-2 font-semibold text-ink">Réponses RSVP — 6 derniers mois</h2>
            <BarChart series={computed.rsvpsByMonth} color="#C6A15B" />
          </section>
          <section className={`p-4 ${glass}`}>
            <h2 className="mb-2 font-semibold text-ink">Taux de présence</h2>
            <Donut yes={computed.yes} no={computed.no} />
          </section>
          <section className={`p-4 ${glass}`}>
            <h2 className="mb-2 font-semibold text-ink">
              Invités confirmés par mois
              <span className="ml-2 rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold-dark">
                total : {computed.totalGuests}
              </span>
            </h2>
            <BarChart series={computed.guestsByMonth} />
          </section>
        </div>
      )}
    </OwnerLayout>
  );
}
