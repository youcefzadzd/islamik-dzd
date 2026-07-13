"use client";

import { useEffect, useMemo, useState } from "react";
import { CATALOG, PRICING, formatDZD } from "@/components/site/site-config";
import { CopyButton, OwnerGate, OwnerLayout, ownerHeaders, glass, OWNER_PASS_KEY } from "./shared";

/* حالات الطلب — نفس قيم عمود status في site_orders.
   الطلب الجديد يصل بحالة new (= En confirmation) ثم يتدرج في السلسلة. */
const STATUSES = [
  { id: "new", label: "En confirmation", cls: "bg-gold/20 text-gold-dark" },
  { id: "preparing", label: "En préparation", cls: "bg-sky-100 text-sky-700" },
  { id: "dispatch", label: "En dispatch", cls: "bg-violet-100 text-violet-700" },
  { id: "delivering", label: "En livraison", cls: "bg-amber-100 text-amber-700" },
  { id: "delivered", label: "Livré", cls: "bg-emerald/10 text-emerald" },
  { id: "returned", label: "Retour", cls: "bg-rose-100 text-rose-700" },
];

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
  const [creatingId, setCreatingId] = useState(null); // طلب يجري إنشاء عرسه
  const [editorWedding, setEditorWedding] = useState(null); // WED-XXX المفتوح في نافذة التحرير

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

  /* «Modifier» = نافذة فيها محرر العرس الكامل لهذا الطلب:
     أول ضغطة تُنشئ العرس من بيانات الطلب وتربطه به، ثم تفتح النافذة —
     **دون تغيير حالة الطلب** (يبقى Nouveau).
     زر «Confirmer» المنفصل هو الذي ينقله إلى En préparation. */
  async function openWedding(o) {
    if (o.wedding_id) {
      setEditorWedding(o.wedding_id);
      return;
    }
    setCreatingId(o.id);
    setLoadError("");
    try {
      const res = await fetch("/api/owner/weddings", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...ownerHeaders() },
        body: JSON.stringify({
          groomName: o.groom_name,
          brideName: o.bride_name,
          weddingDate: o.wedding_date || undefined,
          locationName: o.venue || undefined,
          defaultLanguage: o.lang === "ar" ? "ar" : "fr",
          theme: { template: o.template_id || "islamic-royal" },
          contact: { phone: o.phone },
          // كلمة مؤقتة للوحة الزوجين — غيّرها من محرر العرس قبل التسليم
          dashboardPassword: Math.random().toString(36).slice(2, 10),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Erreur serveur.");
      const weddingId = body.wedding?.wedding_id;
      if (!weddingId) throw new Error("Réponse inattendue du serveur.");
      const saved = await patchOrder(o.id, { weddingId });
      setOrders((prev) => prev.map((x) => (x.id === o.id ? saved : x)));
      setEditorWedding(weddingId);
    } catch (e) {
      setLoadError(e.message);
    } finally {
      setCreatingId(null);
    }
  }

  /* «Toutes» لا تشمل الطلبات قيد التحضير — لها تبويبها الخاص */
  const counts = useMemo(() => {
    const c = { all: orders?.filter((o) => o.status !== "preparing").length || 0 };
    for (const s of STATUSES) c[s.id] = orders?.filter((o) => o.status === s.id).length || 0;
    return c;
  }, [orders]);

  const shown = useMemo(
    () =>
      filter === "all"
        ? orders?.filter((o) => o.status !== "preparing")
        : orders?.filter((o) => o.status === filter),
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
                const busy = creatingId === o.id;
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
                    <td className="whitespace-nowrap px-4 py-3 text-ink/60">
                      {o.wedding_id ? (
                        <span className="rounded bg-emerald/10 px-1.5 py-0.5 text-xs font-semibold text-emerald">
                          {o.wedding_id}
                        </span>
                      ) : (
                        o.wedding_date || "—"
                      )}
                    </td>
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
                      <span className="inline-flex gap-1.5">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => openWedding(o)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60 ${
                            o.wedding_id
                              ? "border border-gold/50 text-gold-dark hover:bg-ivory-dark"
                              : "bg-burgundy text-white hover:bg-burgundy-dark"
                          }`}
                        >
                          {busy ? "Création…" : o.wedding_id ? "Ouvrir le mariage" : "✎ Modifier"}
                        </button>
                        {o.status === "new" && (
                          <button
                            type="button"
                            onClick={() => setStatus(o.id, "preparing")}
                            title="Passer en préparation"
                            className="rounded-lg bg-emerald px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:opacity-90"
                          >
                            ✓ Confirmer
                          </button>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* نافذة محرر العرس الكامل — نفس صفحة /owner/weddings/WED-X/edit
          داخل إطار فوق صفحة الطلبات (بوابة المالك تمرّ تلقائيًا لأن
          كلمة السر محفوظة في sessionStorage لنفس الأصل) */}
      {editorWedding && (
        <div className="fixed inset-0 z-50 flex flex-col bg-ink/50 p-3 backdrop-blur-sm sm:p-6">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="rounded-lg bg-ivory px-3 py-1.5 text-sm font-semibold text-ink shadow">
              Mariage {editorWedding}
            </span>
            <button
              type="button"
              onClick={() => {
                setEditorWedding(null);
                load();
              }}
              className="rounded-lg bg-burgundy px-4 py-1.5 text-sm font-semibold text-white shadow transition-colors hover:bg-burgundy-dark"
            >
              ✕ Fermer
            </button>
          </div>
          <iframe
            src={`/owner/weddings/${encodeURIComponent(editorWedding)}/edit`}
            title={`Mariage ${editorWedding}`}
            className="w-full flex-1 rounded-2xl border border-gold/30 bg-ivory shadow-royal"
          />
        </div>
      )}
    </OwnerLayout>
  );
}
