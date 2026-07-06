"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * Client dashboard for one wedding: /dashboard/[weddingId]
 * Password-gated (checked server-side); shows stats, searchable and
 * filterable responses, CSV export and per-row delete.
 */

/* count helpers — legacy rows (pre-companions) only carry guest_count */
const rowTotal = (r) => r.total_guests ?? r.guest_count ?? 0;
const rowAdults = (r) =>
  r.adult_count ?? (r.attendance_status === "yes" ? r.guest_count ?? 0 : 0);
const rowChildren = (r) => r.child_count ?? 0;
export default function DashboardClient({ weddingId }) {
  const storageKey = `dash-pass-${weddingId}`;
  const [password, setPassword] = useState("");
  const [granted, setGranted] = useState(false);
  const [authError, setAuthError] = useState("");
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | yes | no

  useEffect(() => {
    const saved = sessionStorage.getItem(storageKey);
    if (saved) {
      setPassword(saved);
      load(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load(pass) {
    setLoading(true);
    setAuthError("");
    try {
      const res = await fetch(`/api/rsvp/${encodeURIComponent(weddingId)}`, {
        headers: { "x-dashboard-password": pass },
      });
      if (res.status === 401) {
        sessionStorage.removeItem(storageKey);
        setGranted(false);
        setAuthError("Mot de passe incorrect.");
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setAuthError(
          body.error === "supabase not configured"
            ? "Supabase n'est pas configuré côté serveur (voir SUPABASE_SETUP.md)."
            : "Erreur du serveur. Réessayez."
        );
        return;
      }
      const { rows } = await res.json();
      sessionStorage.setItem(storageKey, pass);
      setGranted(true);
      setRows(rows);
    } finally {
      setLoading(false);
    }
  }

  async function removeRow(id) {
    if (!window.confirm("Supprimer cette réponse ?")) return;
    await fetch(`/api/rsvp/${encodeURIComponent(weddingId)}`, {
      method: "DELETE",
      headers: {
        "x-dashboard-password": sessionStorage.getItem(storageKey) || password,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });
    load(sessionStorage.getItem(storageKey) || password);
  }

  const filtered = useMemo(() => {
    let out = rows || [];
    if (filter !== "all") out = out.filter((r) => r.attendance_status === filter);
    const q = search.trim().toLowerCase();
    if (q) out = out.filter((r) => (r.guest_name || "").toLowerCase().includes(q));
    return out;
  }, [rows, filter, search]);

  function exportCsv() {
    const header = [
      "Nom",
      "Présence",
      "Adultes",
      "Enfants",
      "Total invités",
      "Accompagnants",
      "Types accompagnants",
      "Message",
      "Langue",
      "Date",
    ];
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = (rows || []).map((r) => {
      const companions = Array.isArray(r.companions) ? r.companions : [];
      return [
        r.guest_name,
        r.attendance_status === "yes" ? "Présent" : "Absent",
        rowAdults(r),
        rowChildren(r),
        rowTotal(r),
        companions.map((c) => c.name).join(" | "),
        companions.map((c) => (c.type === "child" ? "enfant" : "adulte")).join(" | "),
        r.message,
        r.language,
        new Date(r.created_at).toLocaleString("fr-FR"),
      ]
        .map(esc)
        .join(";");
    });
    // BOM so Excel opens the accents correctly
    const csv = "﻿" + [header.map(esc).join(";"), ...lines].join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `rsvp-${weddingId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ---------- password gate ---------- */
  if (!granted) {
    return (
      <Shell>
        <h1 className="font-monogram text-4xl text-gold-dark">Espace des mariés</h1>
        <p className="mt-3 font-body text-ink/70">Mariage : {weddingId}</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(password);
          }}
          className="mx-auto mt-8 max-w-xs space-y-5 text-left"
        >
          <div>
            <label className="mb-2 block text-xs uppercase tracking-widest text-gold-dark">
              Mot de passe
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-gold/40 bg-transparent py-2 font-body text-lg outline-none focus:border-burgundy"
            />
          </div>
          {authError && <p className="text-sm text-burgundy">{authError}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-burgundy px-6 py-3 text-sm uppercase tracking-[0.18em] text-ivory-light shadow-card transition-colors hover:bg-burgundy-dark disabled:opacity-60"
          >
            {loading ? "Vérification…" : "Accéder"}
          </button>
        </form>
      </Shell>
    );
  }

  /* ---------- dashboard ---------- */
  const attending = (rows || []).filter((r) => r.attendance_status === "yes");
  const declined = (rows || []).filter((r) => r.attendance_status === "no");
  const totalAdults = attending.reduce((s, r) => s + rowAdults(r), 0);
  const totalChildren = attending.reduce((s, r) => s + rowChildren(r), 0);
  const totalGuests = attending.reduce((s, r) => s + rowTotal(r), 0);

  return (
    <Shell wide>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-left">
          <h1 className="font-monogram text-4xl text-gold-dark">Réponses des invités</h1>
          <p className="mt-1 font-body text-sm text-ink/60">{weddingId}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={exportCsv}
            className="rounded-full border border-gold/50 px-4 py-1.5 text-sm text-gold-dark transition-colors hover:bg-ivory-dark"
          >
            ⬇ Export CSV
          </button>
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem(storageKey);
              setGranted(false);
              setRows(null);
              setPassword("");
            }}
            className="rounded-full border border-gold/50 px-4 py-1.5 text-sm text-gold-dark transition-colors hover:bg-ivory-dark"
          >
            Quitter
          </button>
        </div>
      </div>

      {/* stats */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          ["Réponses", (rows || []).length],
          ["Présents", attending.length],
          ["Absents", declined.length],
          ["Adultes", totalAdults],
          ["Enfants", totalChildren],
          ["Invités au total", totalGuests],
        ].map(([label, value]) => (
          <div key={label} className="lux-card px-2 py-5 text-center">
            <p className="relative font-serif text-3xl text-burgundy">{value}</p>
            <p className="relative mt-1 text-[0.65rem] uppercase tracking-[0.16em] text-gold-dark">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* search + filter */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un invité…"
          className="w-full border-b border-gold/40 bg-transparent py-2 font-body text-lg outline-none focus:border-burgundy"
        />
        <div className="flex shrink-0 gap-2">
          {[
            ["all", "Tous"],
            ["yes", "Présents"],
            ["no", "Absents"],
          ].map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setFilter(val)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                filter === val
                  ? "border-burgundy bg-burgundy text-ivory-light"
                  : "border-gold/50 text-gold-dark hover:bg-ivory-dark"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* responses */}
      <div className="mt-6 space-y-3">
        {loading && <p className="text-center font-body text-ink/60">Chargement…</p>}
        {!loading && filtered.length === 0 && (
          <p className="py-6 text-center font-body text-lg text-ink/60">
            Aucune réponse{search || filter !== "all" ? " pour ce filtre" : " pour le moment"}.
          </p>
        )}
        {filtered.map((r) => (
          <div key={r.id} className="lux-card px-5 py-4 text-left">
            <div className="relative flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-serif text-lg text-ink">
                  {r.guest_name}{" "}
                  <span className={r.attendance_status === "yes" ? "text-burgundy" : "text-ink/50"}>
                    {r.attendance_status === "yes"
                      ? `✓ présent · ${rowTotal(r)} pers.`
                      : "✗ absent"}
                  </span>
                </p>
                {r.attendance_status === "yes" && rowTotal(r) > 1 && (
                  <p className="mt-0.5 text-xs text-ink/60">
                    {rowAdults(r)} adulte{rowAdults(r) > 1 ? "s" : ""}
                    {rowChildren(r) > 0 &&
                      ` · ${rowChildren(r)} enfant${rowChildren(r) > 1 ? "s" : ""}`}
                  </p>
                )}
                {Array.isArray(r.companions) && r.companions.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {r.companions.map((c, i) => (
                      <li
                        key={i}
                        className="rounded-full border border-gold/40 bg-ivory-light px-2.5 py-0.5 text-xs text-ink/80"
                      >
                        {c.name}
                        <span className="text-gold-dark">
                          {" "}
                          · {c.type === "child" ? "enfant" : "adulte"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {r.message && <p className="mt-1 font-body italic text-ink/75">« {r.message} »</p>}
                <p className="mt-1 text-xs text-ink/45">
                  {new Date(r.created_at).toLocaleString("fr-FR")} · {r.language}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeRow(r.id)}
                className="rounded-full border border-burgundy/40 px-3 py-1 text-xs uppercase tracking-wider text-burgundy transition-colors hover:bg-burgundy hover:text-ivory-light"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </Shell>
  );
}

function Shell({ children, wide = false }) {
  return (
    <main className="page-paper min-h-screen px-4 py-10">
      <div
        className={`lux-panel mx-auto w-full px-5 py-10 text-center sm:px-9 ${
          wide ? "max-w-3xl" : "max-w-md"
        }`}
      >
        <div className="relative">{children}</div>
      </div>
    </main>
  );
}
