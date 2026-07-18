"use client";

import { useEffect, useMemo, useState } from "react";
import {
  OwnerGate,
  OwnerLayout,
  ownerHeaders,
  statusOf,
  CopyButton,
  glass,
  OWNER_PASS_KEY,
} from "./shared";

const PAGE_SIZE = 8;

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
  const [page, setPage] = useState(0);

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

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => setPage(0), [search, statusFilter, sortKey, asc]);

  async function act(method, path, body) {
    await fetch(path, {
      method,
      headers: { ...ownerHeaders(), "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
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
          sortKey === key ? "text-stone-700" : "text-ink/55"
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
      <div className={`mb-4 flex flex-wrap items-center gap-2 p-3 ${glass}`}>
        <input
          placeholder="Rechercher un couple ou un identifiant…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-gold/40 bg-white px-3 py-2 text-sm outline-none focus:border-stone-900"
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
          <option value="archivé">Archivés</option>
        </select>
        <span className="ml-auto text-sm text-ink/55">{filtered.length} résultat(s)</span>
      </div>

      <div className={`overflow-hidden ${glass}`}>
        {/* header (desktop) */}
        <div className="hidden grid-cols-[52px_1.3fr_0.8fr_0.8fr_0.6fr_0.7fr_0.8fr_2fr] items-center gap-2 border-b border-gold/25 px-3 py-2 lg:grid">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink/55">Aperçu</span>
          {sortBtn("name", "Couple")}
          {sortBtn("date", "Date")}
          <span className="text-xs font-semibold uppercase tracking-wider text-ink/55">Modèle</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-ink/55">Langues</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-ink/55">Statut</span>
          {sortBtn("created", "Créé le")}
          <span className="text-xs font-semibold uppercase tracking-wider text-ink/55">Actions</span>
        </div>

        <div className="divide-y divide-gold/15">
          {!rows && <p className="py-8 text-center text-ink/55">Chargement…</p>}
          {rows && pageRows.length === 0 && (
            <p className="py-8 text-center text-ink/55">Aucun mariage ne correspond.</p>
          )}
          {pageRows.map((w) => {
            const s = statusOf(w);
            return (
              <div
                key={w.id}
                className="grid gap-2 px-3 py-3 lg:grid-cols-[52px_1.3fr_0.8fr_0.8fr_0.6fr_0.7fr_0.8fr_2fr] lg:items-center"
              >
                <img
                  src={w.heroImage || "/assets/hero-background.webp"}
                  alt=""
                  className="hidden h-10 w-10 rounded-lg border border-gold/30 object-cover lg:block"
                />
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">
                    {w.display_name || `${w.groom_name} & ${w.bride_name}`}
                  </p>
                  <p className="text-xs text-ink/50">{w.wedding_id}</p>
                </div>
                <p className="text-sm text-ink/75">{w.wedding_date || "—"}</p>
                <p className="text-xs text-ink/60">Islamic Royal</p>
                <p className="text-xs uppercase text-ink/60">
                  {(w.languages || ["fr", "ar"]).join(" · ")}
                </p>
                <p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[0.62rem] uppercase tracking-wider ${s.cls}`}
                  >
                    {s.label}
                  </span>
                </p>
                <p className="text-xs text-ink/55">
                  {w.created_at ? new Date(w.created_at).toLocaleDateString("fr-FR") : "—"}
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
                  <CopyButton text={`${origin}/w/${w.wedding_id}`} label="lien" />
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
                    onClick={() =>
                      act("POST", `/api/owner/weddings/${encodeURIComponent(w.wedding_id)}/duplicate`)
                    }
                    className="rounded-md border border-gold/50 px-2 py-0.5 text-xs text-gold-dark hover:bg-ivory-dark"
                  >
                    dupliquer
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      act("PATCH", `/api/owner/weddings/${encodeURIComponent(w.wedding_id)}`, {
                        archived: !w.archived,
                      })
                    }
                    className="rounded-md border border-gold/50 px-2 py-0.5 text-xs text-gold-dark hover:bg-ivory-dark"
                  >
                    {w.archived ? "restaurer" : "archiver"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Supprimer ${w.wedding_id} et toutes ses réponses RSVP ?`))
                        act("DELETE", `/api/owner/weddings/${encodeURIComponent(w.wedding_id)}`);
                    }}
                    className="rounded-md border border-stone-400 px-2 py-0.5 text-xs text-stone-700 hover:bg-stone-900 hover:text-white"
                  >
                    supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 border-t border-gold/25 px-3 py-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-gold/40 px-3 py-1 text-sm text-gold-dark disabled:opacity-40"
            >
              ←
            </button>
            <span className="text-sm text-ink/60">
              Page {page + 1} / {pages}
            </span>
            <button
              type="button"
              disabled={page >= pages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-gold/40 px-3 py-1 text-sm text-gold-dark disabled:opacity-40"
            >
              →
            </button>
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}
