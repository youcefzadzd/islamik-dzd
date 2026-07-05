"use client";

import { useEffect, useMemo, useState } from "react";
import {
  OwnerGate,
  OwnerLayout,
  ownerHeaders,
  statusOf,
  CopyButton,
  OWNER_PASS_KEY,
} from "./shared";

const SORTS = {
  date: (a, b) => (a.wedding_date || "9999").localeCompare(b.wedding_date || "9999"),
  created: (a, b) => (b.created_at || "").localeCompare(a.created_at || ""),
  name: (a, b) =>
    (a.display_name || a.groom_name || "").localeCompare(b.display_name || b.groom_name || ""),
};

export default function WeddingsTable() {
  const [granted, setGranted] = useState(false);
  const [rows, setRows] = useState(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("created");
  const [asc, setAsc] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

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

  const filtered = useMemo(() => {
    let out = [...(rows || [])];
    const q = search.trim().toLowerCase();
    if (q) {
      out = out.filter((w) =>
        [w.display_name, w.groom_name, w.bride_name, w.wedding_id]
          .filter(Boolean)
          .some((s) => s.toLowerCase().includes(q))
      );
    }
    if (statusFilter !== "all") out = out.filter((w) => statusOf(w).label === statusFilter);
    out.sort(SORTS[sortKey]);
    if (!asc) out.reverse();
    return out;
  }, [rows, search, sortKey, asc, statusFilter]);

  async function removeWedding(weddingId) {
    if (!window.confirm(`Supprimer ${weddingId} et toutes ses réponses RSVP ?`)) return;
    await fetch(`/api/owner/weddings/${encodeURIComponent(weddingId)}`, {
      method: "DELETE",
      headers: ownerHeaders(),
    });
    load();
  }

  function sortBtn(key, label) {
    return (
      <button
        type="button"
        onClick={() => {
          if (sortKey === key) setAsc(!asc);
          else {
            setSortKey(key);
            setAsc(true);
          }
        }}
        className={`text-left text-xs font-semibold uppercase tracking-wider ${
          sortKey === key ? "text-burgundy" : "text-ink/55"
        }`}
      >
        {label} {sortKey === key ? (asc ? "↑" : "↓") : ""}
      </button>
    );
  }

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

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <OwnerLayout active="/owner/weddings" title="Mariages">
      {/* toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          placeholder="Rechercher un couple ou un identifiant…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-gold/40 bg-white px-3 py-2 text-sm outline-none focus:border-burgundy"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gold/40 bg-white px-3 py-2 text-sm outline-none"
        >
          <option value="all">Tous les statuts</option>
          <option value="à venir">À venir</option>
          <option value="passé">Passés</option>
          <option value="sans date">Sans date</option>
        </select>
        <a
          href="/owner/weddings/new"
          className="ml-auto rounded-xl bg-burgundy px-4 py-2 text-sm font-semibold text-white hover:bg-burgundy-dark"
        >
          + Nouveau mariage
        </a>
      </div>

      {/* header row (desktop) */}
      <div className="hidden grid-cols-[1.4fr_0.9fr_0.7fr_2fr] gap-2 border-b border-gold/30 px-3 pb-2 md:grid">
        {sortBtn("name", "Couple")}
        {sortBtn("date", "Date")}
        <span className="text-xs font-semibold uppercase tracking-wider text-ink/55">Statut</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-ink/55">Actions</span>
      </div>

      {/* rows */}
      <div className="divide-y divide-gold/20">
        {!rows && <p className="py-8 text-center text-ink/55">Chargement…</p>}
        {rows && filtered.length === 0 && (
          <p className="py-8 text-center text-ink/55">Aucun mariage ne correspond.</p>
        )}
        {filtered.map((w) => {
          const s = statusOf(w);
          return (
            <div
              key={w.id}
              className="grid gap-2 px-3 py-3 md:grid-cols-[1.4fr_0.9fr_0.7fr_2fr] md:items-center"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">
                  {w.display_name || `${w.groom_name} & ${w.bride_name}`}
                </p>
                <p className="text-xs text-ink/50">{w.wedding_id}</p>
              </div>
              <p className="text-sm text-ink/75">{w.wedding_date || "—"}</p>
              <p>
                <span className={`rounded-full px-2 py-0.5 text-[0.65rem] uppercase tracking-wider ${s.cls}`}>
                  {s.label}
                </span>
              </p>
              <div className="flex flex-wrap items-center gap-1.5 text-sm">
                <a
                  href={`/w/${w.wedding_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-gold/50 px-2 py-0.5 text-xs text-gold-dark hover:bg-ivory-dark"
                >
                  aperçu
                </a>
                <CopyButton text={`${origin}/w/${w.wedding_id}`} label="copier lien" />
                <a
                  href={`/dashboard/${w.wedding_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-gold/50 px-2 py-0.5 text-xs text-gold-dark hover:bg-ivory-dark"
                >
                  dashboard
                </a>
                <a
                  href={`/owner/weddings/${w.wedding_id}/edit`}
                  className="rounded-md border border-gold/50 px-2 py-0.5 text-xs text-gold-dark hover:bg-ivory-dark"
                >
                  modifier
                </a>
                <button
                  type="button"
                  onClick={() => removeWedding(w.wedding_id)}
                  className="rounded-md border border-burgundy/40 px-2 py-0.5 text-xs text-burgundy hover:bg-burgundy hover:text-white"
                >
                  supprimer
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </OwnerLayout>
  );
}
