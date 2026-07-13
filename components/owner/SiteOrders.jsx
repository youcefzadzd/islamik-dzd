"use client";

import { useEffect, useMemo, useState } from "react";
import { CATALOG, PRICING, formatDZD } from "@/components/site/site-config";
import { CopyButton, OwnerGate, OwnerLayout, ownerHeaders, glass, OWNER_PASS_KEY } from "./shared";

/* حالات الطلب — نفس قيم عمود status في site_orders */
const STATUSES = [
  { id: "new", label: "Nouveau", cls: "bg-gold/20 text-gold-dark" },
  { id: "contacted", label: "Contacté", cls: "bg-burgundy/10 text-burgundy" },
  { id: "preparing", label: "En préparation", cls: "bg-sky-100 text-sky-700" },
  { id: "done", label: "Terminé", cls: "bg-emerald/10 text-emerald" },
  { id: "cancelled", label: "Annulé", cls: "bg-ink/10 text-ink/50" },
];

const LIVE_TEMPLATES = CATALOG.filter((c) => !c.comingSoon);
const templateName = (id) => CATALOG.find((c) => c.id === id)?.name || id || "—";
const packOf = (id) => PRICING.find((p) => p.id === id) || null;

/* رقم واتساب الزبون: أرقام محلية جزائرية 05xx → 2135xx */
function customerWhatsApp(phone) {
  let digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = "213" + digits.slice(1);
  return `https://wa.me/${digits}`;
}

export default function SiteOrders() {
  const [granted, setGranted] = useState(false);
  const [orders, setOrders] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(null); // الطلب المفتوح في نافذة التعديل

  async function load() {
    setLoadError("");
    const res = await fetch("/api/owner/site-orders", { headers: ownerHeaders() });
    if (res.status === 401) return setGranted(false);
    setGranted(true);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setOrders([]);
      return setLoadError(
        body.error?.includes("site_orders table missing")
          ? "La table site_orders n'existe pas encore — exécutez supabase/site-orders-migration.sql."
          : body.error || "Erreur serveur."
      );
    }
    setOrders(body.orders);
  }

  useEffect(() => {
    if (sessionStorage.getItem(OWNER_PASS_KEY)) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* تعديل جزئي (الحالة من الجدول) — متفائل مع تراجع عند الفشل */
  async function patchOrder(id, fields) {
    const res = await fetch("/api/owner/site-orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...ownerHeaders() },
      body: JSON.stringify({ id, ...fields }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Erreur serveur.");
    return body.order;
  }

  async function setStatus(id, status) {
    const before = orders;
    setOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)));
    try {
      await patchOrder(id, { status });
    } catch {
      setOrders(before);
    }
  }

  function applySaved(order) {
    setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
    setEditing(null);
  }

  const counts = useMemo(() => {
    const c = { all: orders?.length || 0 };
    for (const s of STATUSES) c[s.id] = orders?.filter((o) => o.status === s.id).length || 0;
    return c;
  }, [orders]);

  const shown = useMemo(
    () => (filter === "all" ? orders : orders?.filter((o) => o.status === filter)),
    [orders, filter]
  );

  if (!granted) return <OwnerGate onGranted={() => load()} />;

  return (
    <OwnerLayout active="/owner/orders" title="Commandes du site">
      {/* عدّادات + فلترة بالحالة */}
      <div className="mb-4 flex flex-wrap gap-2">
        {[{ id: "all", label: "Toutes", cls: "bg-white/70 text-ink/70" }, ...STATUSES].map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setFilter(s.id)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              filter === s.id ? "border-burgundy bg-burgundy text-white" : `border-gold/30 ${s.cls}`
            }`}
          >
            {s.label} · {counts[s.id]}
          </button>
        ))}
        <button
          type="button"
          onClick={load}
          className="ml-auto rounded-full border border-gold/40 px-3.5 py-1.5 text-xs font-semibold text-gold-dark transition-colors hover:bg-ivory-dark"
        >
          ↻ Actualiser
        </button>
      </div>

      {loadError && <p className={`mb-4 p-4 text-sm text-burgundy ${glass}`}>{loadError}</p>}
      {!orders && !loadError && <p className="py-10 text-center text-ink/55">Chargement…</p>}
      {orders && !loadError && shown.length === 0 && (
        <p className={`p-8 text-center text-sm text-ink/55 ${glass}`}>
          Aucune commande {filter !== "all" ? "dans ce statut" : "pour le moment"}.
        </p>
      )}

      {shown?.length > 0 && (
        <div className={`overflow-x-auto ${glass}`}>
          <table className="w-full min-w-[920px] text-sm">
            <thead>
              <tr className="border-b border-gold/25 text-left text-xs uppercase tracking-wider text-ink/45">
                <th className="px-4 py-3">Reçue le</th>
                <th className="px-4 py-3">Couple</th>
                <th className="px-4 py-3">Téléphone</th>
                <th className="px-4 py-3">Modèle</th>
                <th className="px-4 py-3">Pack</th>
                <th className="px-4 py-3">Mariage</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {shown.map((o) => {
                const pack = packOf(o.pack_id);
                const wa = customerWhatsApp(o.phone);
                const st = STATUSES.find((s) => s.id === o.status) || STATUSES[0];
                return (
                  <tr key={o.id} className="border-b border-gold/10 last:border-0 hover:bg-white/50">
                    <td className="whitespace-nowrap px-4 py-3 text-ink/60">
                      {(o.created_at || "").slice(0, 16).replace("T", " ")}
                      <span className="ml-2 rounded bg-ivory-dark px-1.5 py-0.5 text-[0.65rem] uppercase text-ink/45">
                        {o.lang}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-ink">
                      {o.groom_name} & {o.bride_name}
                      {o.venue ? (
                        <span className="block text-xs font-normal text-ink/45">📍 {o.venue}</span>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span dir="ltr" className="tabular-nums text-ink/80">{o.phone}</span>
                      <span className="ml-2 inline-flex gap-1.5 align-middle">
                        <CopyButton text={o.phone} />
                        {wa && (
                          <a
                            href={wa}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Ouvrir WhatsApp"
                            className="rounded-md border border-emerald/40 px-2 py-0.5 text-xs text-emerald transition-colors hover:bg-emerald/10"
                          >
                            WhatsApp
                          </a>
                        )}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink/75">{templateName(o.template_id)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink/75">
                      {pack ? (
                        <>
                          {pack.name.fr}
                          <span className="block text-xs text-ink/45">{formatDZD(pack.price, "fr")}</span>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink/60">{o.wedding_date || "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <select
                        value={o.status}
                        onChange={(e) => setStatus(o.id, e.target.value)}
                        className={`rounded-lg border border-gold/30 px-2 py-1 text-xs font-semibold outline-none ${st.cls}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setEditing(o)}
                        className="rounded-lg border border-gold/40 px-3 py-1.5 text-xs font-semibold text-gold-dark transition-colors hover:bg-ivory-dark"
                      >
                        ✎ Modifier
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <EditOrderModal
          order={editing}
          onClose={() => setEditing(null)}
          onSaved={applySaved}
          patchOrder={patchOrder}
        />
      )}
    </OwnerLayout>
  );
}

/* ------------------------------------------------------------------ */
/* نافذة تعديل الطلب — كل الحقول + «Confirmer» ينقله إلى En préparation */
/* ------------------------------------------------------------------ */

function EditOrderModal({ order, onClose, onSaved, patchOrder }) {
  const [groom, setGroom] = useState(order.groom_name || "");
  const [bride, setBride] = useState(order.bride_name || "");
  const [phone, setPhone] = useState(order.phone || "");
  const [date, setDate] = useState(order.wedding_date || "");
  const [venue, setVenue] = useState(order.venue || "");
  const [templateId, setTemplateId] = useState(order.template_id || "");
  const [packId, setPackId] = useState(order.pack_id || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const fields = () => ({
    groomName: groom,
    brideName: bride,
    phone,
    weddingDate: date,
    venue,
    templateId,
    packId,
  });

  async function save(extra = {}) {
    setError("");
    if (groom.trim().length < 2) return setError("Nom du marié invalide.");
    if (bride.trim().length < 2) return setError("Nom de la mariée invalide.");
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15) return setError("Téléphone invalide.");
    setBusy(true);
    try {
      const saved = await patchOrder(order.id, { ...fields(), ...extra });
      onSaved(saved);
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-lg border border-gold/40 bg-white px-3 py-2 text-sm outline-none focus:border-burgundy";
  const label = "mb-1 block text-xs font-semibold uppercase tracking-wider text-ink/50";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`max-h-[90vh] w-full max-w-lg overflow-y-auto p-6 ${glass} !bg-ivory`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Modifier la commande</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-lg border border-gold/40 px-2.5 py-1 text-sm text-ink/60 hover:bg-ivory-dark"
          >
            ✕
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Marié</label>
            <input className={input} value={groom} onChange={(e) => setGroom(e.target.value)} />
          </div>
          <div>
            <label className={label}>Mariée</label>
            <input className={input} value={bride} onChange={(e) => setBride(e.target.value)} />
          </div>
          <div>
            <label className={label}>Téléphone</label>
            <input className={input} dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <label className={label}>Date du mariage</label>
            <input className={input} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Lieu / salle</label>
            <input className={input} value={venue} onChange={(e) => setVenue(e.target.value)} />
          </div>
          <div>
            <label className={label}>Modèle</label>
            <select className={input} value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
              <option value="">—</option>
              {LIVE_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Pack</label>
            <select className={input} value={packId} onChange={(e) => setPackId(e.target.value)}>
              <option value="">—</option>
              {PRICING.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name.fr} — {formatDZD(p.price, "fr")}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="mt-4 rounded-lg bg-burgundy/10 px-3 py-2 text-sm text-burgundy">{error}</p>}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            disabled={busy}
            onClick={() => save()}
            className="rounded-xl border border-gold/50 px-5 py-2.5 text-sm font-semibold text-gold-dark transition-colors hover:bg-ivory-dark disabled:opacity-60"
          >
            Enregistrer
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => save({ status: "preparing" })}
            className="flex-1 rounded-xl bg-burgundy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-burgundy-dark disabled:opacity-60"
          >
            {busy ? "…" : "Confirmer → En préparation"}
          </button>
        </div>
      </div>
    </div>
  );
}
