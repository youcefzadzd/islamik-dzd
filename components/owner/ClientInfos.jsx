"use client";

/**
 * Fiches mariage — استمارات /infos كما تصل من العملاء.
 * قائمة بأحدث الاستمارات، تفاصيل قابلة للفتح، تعليم "معالجة"، حذف.
 * الصلاحية: المالك أو عامل «orders».
 */

import { useEffect, useState } from "react";
import {
  AccessDenied,
  OwnerGate,
  OwnerLayout,
  ownerHeaders,
  glass,
  hasStoredCredentials,
} from "./shared";
import { CATALOG, PRICING } from "@/components/site/site-config";

const tplName = (id) => CATALOG.find((c) => c.id === id)?.name || id || "—";
const packName = (id) => {
  const p = PRICING.find((x) => x.id === id);
  return p ? `${p.name.fr} (${p.price} DA)` : id || "—";
};
const fmtDate = (iso) =>
  new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export default function ClientInfos() {
  const [granted, setGranted] = useState(false);
  const [denied, setDenied] = useState(false);
  const [infos, setInfos] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [open, setOpen] = useState(null);

  async function load() {
    const res = await fetch("/api/owner/client-infos", { headers: ownerHeaders() });
    if (res.status === 401) return setGranted(false);
    setGranted(true);
    if (res.status === 403) return setDenied(true);
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      setLoadError(j.error || "Erreur serveur.");
      return;
    }
    setLoadError("");
    setInfos(j.infos || []);
  }

  useEffect(() => {
    if (hasStoredCredentials()) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function setStatus(id, status) {
    await fetch("/api/owner/client-infos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...ownerHeaders() },
      body: JSON.stringify({ id, status }),
    });
    setInfos((l) => l.map((x) => (x.id === id ? { ...x, status } : x)));
  }

  async function remove(id) {
    if (!window.confirm("Supprimer cette fiche définitivement ?")) return;
    await fetch("/api/owner/client-infos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...ownerHeaders() },
      body: JSON.stringify({ id }),
    });
    setInfos((l) => l.filter((x) => x.id !== id));
  }

  if (!granted) return <OwnerGate onGranted={() => load()} />;
  if (denied) return <AccessDenied />;

  const newCount = infos.filter((i) => i.status !== "processed").length;

  return (
    <OwnerLayout active="/owner/infos" title="Fiches mariage">
      <div className={`p-5 ${glass}`}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-ink/65">
            {infos.length} fiche{infos.length > 1 ? "s" : ""} —{" "}
            <span className="font-semibold text-ink/85">{newCount} nouvelle{newCount > 1 ? "s" : ""}</span>
          </p>
          <button
            type="button"
            onClick={load}
            className="rounded-lg border border-gold/50 px-3 py-1.5 text-sm text-gold-dark hover:bg-ivory-dark"
          >
            ↻ Actualiser
          </button>
        </div>

        {loadError ? (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Table non disponible : {loadError}</p>
            <p className="mt-1">
              Exécutez la migration <code>supabase/client-infos-migration.sql</code> (Supabase →
              SQL Editor → Run). En attendant, les fiches des clients partent sur WhatsApp.
            </p>
          </div>
        ) : infos.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink/45">
            Aucune fiche pour le moment — partagez le lien <code>dawati-dz.com/infos</code> avec vos clients.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {infos.map((i) => {
              const isOpen = open === i.id;
              const processed = i.status === "processed";
              return (
                <li key={i.id} className="rounded-xl border border-stone-200 bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i.id)}
                    className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-start"
                  >
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${processed ? "bg-stone-300" : "bg-emerald-500"}`}
                      title={processed ? "Traitée" : "Nouvelle"}
                    />
                    <span className="font-semibold text-stone-900">
                      {i.groom_name} &amp; {i.bride_name}
                    </span>
                    <span className="text-sm tabular-nums text-stone-500" dir="ltr">{i.phone}</span>
                    <span className="text-sm text-stone-500">{tplName(i.template_id)}</span>
                    <span className="ms-auto text-xs text-stone-400">{fmtDate(i.created_at)}</span>
                    <span aria-hidden className="text-stone-400">{isOpen ? "▴" : "▾"}</span>
                  </button>

                  {isOpen ? (
                    <div className="border-t border-stone-100 px-4 py-4">
                      <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                        {[
                          ["Marié", `${i.groom_name}${i.groom_name_ar ? ` (${i.groom_name_ar})` : ""}`],
                          ["Mariée", `${i.bride_name}${i.bride_name_ar ? ` (${i.bride_name_ar})` : ""}`],
                          ["Invitation au nom de", i.honoree === "bride" ? "la mariée" : "le marié"],
                          ["Père", i.father_name],
                          ["Mère", i.mother_name],
                          ["Date", i.wedding_date],
                          ["Heure", i.wedding_time],
                          ["Salle", i.venue],
                          ["Adresse", i.address],
                          ["Template", tplName(i.template_id)],
                          ["Pack", packName(i.pack_id)],
                          ["Langue", i.lang === "fr" ? "Français" : "Arabe"],
                        ]
                          .filter(([, v]) => v)
                          .map(([k, v]) => (
                            <div key={k} className="flex gap-2">
                              <dt className="w-36 shrink-0 text-stone-400">{k}</dt>
                              <dd className="text-stone-800">{v}</dd>
                            </div>
                          ))}
                      </dl>
                      {i.maps_url ? (
                        <p className="mt-2 text-sm">
                          <a href={i.maps_url} target="_blank" rel="noreferrer" className="text-gold-dark underline underline-offset-2">
                            🗺 Ouvrir dans Google Maps
                          </a>
                        </p>
                      ) : null}
                      {i.program ? (
                        <div className="mt-3">
                          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Programme</p>
                          <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-stone-50 p-3 font-sans text-sm text-stone-700">{i.program}</pre>
                        </div>
                      ) : null}
                      {i.notes ? (
                        <div className="mt-3">
                          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Demandes spéciales</p>
                          <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-stone-50 p-3 font-sans text-sm text-stone-700">{i.notes}</pre>
                        </div>
                      ) : null}

                      <div className="mt-4 flex flex-wrap gap-2">
                        <a
                          href={`https://wa.me/${i.phone.replace(/\D/g, "").replace(/^0/, "213")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
                        >
                          WhatsApp client
                        </a>
                        <button
                          type="button"
                          onClick={() => setStatus(i.id, processed ? "new" : "processed")}
                          className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50"
                        >
                          {processed ? "Remettre en nouvelle" : "✓ Marquer traitée"}
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(i.id)}
                          className="rounded-lg border border-rose-200 px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </OwnerLayout>
  );
}
