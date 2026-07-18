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
  { id: "cancelled", label: "Annulé", cls: "bg-ink/10 text-ink/50" },
];

/* motifs محاولات الاتصال (نمط EcoManager) — عدّل القائمة بحرّية */
const MOTIFS = [
  "DAY 1 NRP 1",
  "DAY 1 NRP 3 SMS",
  "DAY 2 NRP 1",
  "DAY 3 NRP 1",
  "En attente de confirmation du client",
  "WhatsApp",
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
  const [creatingId, setCreatingId] = useState(null); // طلب يجري إنشاء عرسه
  const [editorWedding, setEditorWedding] = useState(null); // WED-XXX المفتوح في نافذة التحرير
  const [expandedId, setExpandedId] = useState(null); // الصف المفتوح بزر ➕
  const [confirmingOrder, setConfirmingOrder] = useState(null); // نافذة اختيار الباقة عند التأكيد
  const [motifFilter, setMotifFilter] = useState(""); // فلترة بعمود Statut de confirmation

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

  /* صفحة Saisir les infos (داخل iframe) تُرسل رسالة عند حفظ المعلومات
     كاملة → نغلق النافذة ونُعلّم الطلبية كمكتملة */
  useEffect(() => {
    function onMessage(e) {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type !== "dawati-infos-saved") return;
      const { weddingId, dashboardPassword } = e.data;
      setEditorWedding(null);
      setOrders((prev) => {
        const target = prev?.find((o) => o.wedding_id === weddingId);
        if (target) {
          patchOrder(target.id, {
            infosComplete: true,
            ...(dashboardPassword ? { dashboardPassword } : {}),
          })
            .then((saved) => applySaved(saved))
            .catch(() => {});
        }
        return prev;
      });
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
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

  function applySaved(order) {
    setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
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

  /* تغيير motif التأكيد مباشرة من عمود الجدول (تبويب En confirmation) */
  async function setMotif(id, motif) {
    const before = orders;
    setOrders(orders.map((o) => (o.id === id ? { ...o, confirmation_status: motif || null } : o)));
    try {
      await patchOrder(id, { confirmationStatus: motif });
    } catch {
      setOrders(before);
    }
  }

  /* تغيير الباقة مباشرة من عمود الجدول — دون فتح التفاصيل */
  async function setPack(id, packId) {
    const before = orders;
    setOrders(orders.map((o) => (o.id === id ? { ...o, pack_id: packId || null } : o)));
    try {
      await patchOrder(id, { packId });
    } catch {
      setOrders(before);
    }
  }

  async function deleteOrder(id) {
    if (!window.confirm("Supprimer définitivement cette commande ?")) return;
    const res = await fetch("/api/owner/site-orders", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...ownerHeaders() },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setExpandedId(null);
      setOrders((prev) => prev.filter((o) => o.id !== id));
    }
  }

  /* «Modifier» = نافذة فيها محرر العرس الكامل لهذا الطلب:
     أول ضغطة تُنشئ العرس من بيانات الطلب وتربطه به — دون تغيير حالته. */
  async function openWedding(o) {
    if (o.wedding_id) {
      setEditorWedding(o.wedding_id);
      return;
    }
    setCreatingId(o.id);
    setLoadError("");
    const generatedPassword = Math.random().toString(36).slice(2, 10);
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
          // كلمة لوحة الزوجين — تُحفظ على الطلب لتسليمها للزبون،
          // وتتحدّث تلقائيًا إن غُيّرت من صفحة Saisir les infos
          dashboardPassword: generatedPassword,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Erreur serveur.");
      const weddingId = body.wedding?.wedding_id;
      if (!weddingId) throw new Error("Réponse inattendue du serveur.");
      const saved = await patchOrder(o.id, {
        weddingId,
        dashboardPassword: generatedPassword,
      });
      applySaved(saved);
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

  const shown = useMemo(() => {
    let rows =
      filter === "all"
        ? orders?.filter((o) => o.status !== "preparing")
        : orders?.filter((o) => o.status === filter);
    if (motifFilter === "none") rows = rows?.filter((o) => !o.confirmation_status);
    else if (motifFilter) rows = rows?.filter((o) => o.confirmation_status === motifFilter);
    return rows;
  }, [orders, filter, motifFilter]);

  if (!granted) return <OwnerGate onGranted={() => load()} />;

  return (
    <OwnerLayout active="/owner/orders" title="Commandes du site">
      {/* عدّادات + فلترة بالحالة */}
      <div className="mb-4 flex flex-wrap gap-2">
        {[{ id: "all", label: "Toutes", cls: "bg-white/70 text-ink/70" }, ...STATUSES].map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setFilter(s.id);
              setMotifFilter("");
            }}
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
          <table className="w-full min-w-[1000px] text-sm">
            <thead>
              <tr className="border-b border-gold/25 text-left text-xs uppercase tracking-wider text-ink/45">
                <th className="w-10 px-3 py-3" />
                <th className="px-4 py-3">Reçue le</th>
                <th className="px-4 py-3">Couple</th>
                {filter !== "preparing" && (
                <th className="px-4 py-3">
                  <span className="block">Statut de confirmation</span>
                  {/* فلترة بجميع خيارات الـ motif — مثل صف الفلاتر في EcoManager */}
                  <select
                    value={motifFilter}
                    onChange={(e) => setMotifFilter(e.target.value)}
                    className={`mt-1.5 w-full max-w-[180px] rounded-lg border px-2 py-1 text-[0.68rem] font-semibold normal-case tracking-normal outline-none ${
                      motifFilter
                        ? "border-burgundy bg-burgundy/10 text-burgundy"
                        : "border-gold/30 bg-white text-ink/60"
                    }`}
                  >
                    <option value="">Tous</option>
                    <option value="none">Sans motif</option>
                    {MOTIFS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </th>
                )}
                <th className="px-4 py-3">Téléphone</th>
                <th className="px-4 py-3">Modèle</th>
                <th className="px-4 py-3">Pack</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {shown.map((o) => {
                const pack = packOf(o.pack_id);
                const wa = customerWhatsApp(o.phone);
                const st = STATUSES.find((s) => s.id === o.status) || STATUSES[0];
                const busy = creatingId === o.id;
                const open = expandedId === o.id;
                return (
                  <RowGroup key={o.id}>
                    <tr
                      className={`border-b border-gold/10 last:border-0 ${
                        open
                          ? "bg-white/70"
                          : o.infos_complete
                            ? "bg-emerald/5 hover:bg-emerald/10"
                            : "hover:bg-white/50"
                      }`}
                    >
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => setExpandedId(open ? null : o.id)}
                          aria-label={open ? "Réduire" : "Détails"}
                          className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold text-white transition-colors ${
                            open ? "bg-burgundy" : "bg-sky-500 hover:bg-sky-600"
                          }`}
                        >
                          {open ? "−" : "+"}
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink/60">
                        {(o.created_at || "").slice(0, 16).replace("T", " ")}
                        <span className="ml-2 rounded bg-ivory-dark px-1.5 py-0.5 text-[0.65rem] uppercase text-ink/45">
                          {o.lang}
                        </span>
                        {/* في «Toutes»: شارة الحالة تعوّض عمود Statut المحذوف */}
                        {filter === "all" && (
                          <span
                            className={`ml-2 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${st.cls}`}
                          >
                            {st.label}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-ink">
                        {o.groom_name} & {o.bride_name}
                        {o.wedding_id ? (
                          <span className="ml-2 rounded bg-emerald/10 px-1.5 py-0.5 text-[0.65rem] font-semibold text-emerald">
                            {o.wedding_id}
                          </span>
                        ) : null}
                        {/* شارة اكتمال المعلومات — تميّز الطلبية الجاهزة */}
                        {o.infos_complete ? (
                          <span className="ml-2 rounded-full bg-emerald px-2 py-0.5 text-[0.65rem] font-bold text-white">
                            ✓ Infos complètes
                          </span>
                        ) : o.status === "preparing" ? (
                          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[0.65rem] font-bold text-amber-700">
                            ⚠ Infos à saisir
                          </span>
                        ) : null}
                      </td>
                      {filter !== "preparing" && (
                        <td className="whitespace-nowrap px-4 py-3">
                          {filter === "new" ? (
                            /* في تبويب En confirmation: الـ motif يُعدَّل مباشرة من الجدول */
                            <select
                              value={o.confirmation_status || ""}
                              onChange={(e) => setMotif(o.id, e.target.value)}
                              className="rounded-lg border border-gold/30 bg-gold/10 px-2 py-1 text-xs font-semibold text-gold-dark outline-none"
                            >
                              <option value="">—</option>
                              {MOTIFS.map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))}
                            </select>
                          ) : o.confirmation_status ? (
                            <span className="rounded-full bg-gold/15 px-2.5 py-1 text-xs font-semibold text-gold-dark">
                              {o.confirmation_status}
                            </span>
                          ) : (
                            <span className="text-ink/30">—</span>
                          )}
                        </td>
                      )}
                      <td className="whitespace-nowrap px-4 py-3">
                        {/* الرقم قابل للنقر: اتصال مباشر + رابط واتساب */}
                        <a
                          href={`tel:${o.phone}`}
                          dir="ltr"
                          className="tabular-nums font-semibold text-burgundy underline-offset-4 hover:underline"
                        >
                          {o.phone}
                        </a>
                        {wa && (
                          <a
                            href={wa}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Ouvrir WhatsApp"
                            className="ml-1.5 align-middle text-emerald"
                          >
                            🟢
                          </a>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink/75">
                        {templateName(o.template_id)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {/* الباقة تُغيَّر مباشرة من الجدول */}
                        <select
                          value={o.pack_id || ""}
                          onChange={(e) => setPack(o.id, e.target.value)}
                          className="rounded-lg border border-gold/30 bg-white px-2 py-1 text-xs font-semibold text-ink/75 outline-none"
                        >
                          <option value="">—</option>
                          {PRICING.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name.fr} — {formatDZD(p.price, "fr")}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <span className="inline-flex gap-1.5">
                          {o.status === "new" && (
                            <button
                              type="button"
                              onClick={() => setConfirmingOrder(o)}
                              className="rounded-lg bg-emerald px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:opacity-90"
                            >
                              ✔ Confirmer
                            </button>
                          )}
                          {/* بعد حذف عمود Statut: أزرار انتقال حسب المرحلة */}
                          {o.status === "dispatch" && (
                            <button
                              type="button"
                              onClick={() => setStatus(o.id, "delivering")}
                              className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-600"
                            >
                              → En livraison
                            </button>
                          )}
                          {o.status === "delivering" && (
                            <>
                              <button
                                type="button"
                                onClick={() => setStatus(o.id, "delivered")}
                                className="rounded-lg bg-emerald px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:opacity-90"
                              >
                                ✓ Livré
                              </button>
                              <button
                                type="button"
                                onClick={() => setStatus(o.id, "returned")}
                                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rose-700"
                              >
                                ↩ Retour
                              </button>
                            </>
                          )}
                          {o.status === "preparing" && (
                            <>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => openWedding(o)}
                                className="rounded-lg bg-burgundy px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-burgundy-dark disabled:opacity-60"
                              >
                                {busy ? "Création…" : "📋 Saisir les infos"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setStatus(o.id, "dispatch")}
                                className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-violet-700"
                              >
                                → Dispatch
                              </button>
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                    {open && (
                      <tr className="border-b border-gold/10 bg-ivory-light/60">
                        <td colSpan={filter === "preparing" ? 7 : 8} className="px-4 py-5">
                          <RowDetails
                            order={o}
                            wa={wa}
                            pack={pack}
                            patchOrder={patchOrder}
                            applySaved={applySaved}
                            onConfirm={() => setConfirmingOrder(o)}
                            onFillInfos={() => openWedding(o)}
                            onDispatch={() => setStatus(o.id, "dispatch")}
                            onCancel={() => setStatus(o.id, "cancelled")}
                            onDelete={() => deleteOrder(o.id)}
                          />
                        </td>
                      </tr>
                    )}
                  </RowGroup>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* نافذة اختيار الباقة عند تأكيد الطلب — الاختيار ينقل الطلب إلى En préparation */}
      {confirmingOrder && (
        <PackChooser
          order={confirmingOrder}
          onClose={() => setConfirmingOrder(null)}
          onValidated={(saved) => {
            applySaved(saved);
            setConfirmingOrder(null);
          }}
          patchOrder={patchOrder}
        />
      )}

      {/* نافذة محرر العرس الكامل — نفس صفحة /owner/weddings/WED-X/edit
          داخل إطار فوق صفحة الطلبات (بوابة المالك تمرّ تلقائيًا لأن
          كلمة السر محفوظة في sessionStorage لنفس الأصل) */}
      {editorWedding && (
        <div className="fixed inset-0 z-50 flex flex-col bg-ink/50 p-3 backdrop-blur-sm sm:p-6">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="rounded-lg bg-ivory px-3.5 py-1.5 text-sm font-semibold text-ink shadow">
              📋 Saisie des informations client — {editorWedding}
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
            src={`/owner/weddings/${encodeURIComponent(editorWedding)}/edit?embed=1`}
            title={`Mariage ${editorWedding}`}
            className="w-full flex-1 rounded-2xl border border-gold/30 bg-ivory shadow-royal"
          />
        </div>
      )}
    </OwnerLayout>
  );
}

/* React fragment مسمّى حتى يبقى مفتاح كل مجموعة صفوف واحدًا */
function RowGroup({ children }) {
  return <>{children}</>;
}

/* ------------------------------------------------------------------ */
/* تفاصيل الطلب داخل الجدول (نمط EcoManager)                            */
/* ------------------------------------------------------------------ */

/* نافذة تأكيد الطلب: نتفق مع الزبون على الباقة، واختيارها
   يحفظها وينقل الطلب مباشرة إلى En préparation */
function PackChooser({ order, onClose, onValidated, patchOrder }) {
  const [packId, setPackId] = useState(order.pack_id || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function validate() {
    if (!packId) return setError("Choisissez un pack d'abord.");
    setBusy(true);
    setError("");
    try {
      const saved = await patchOrder(order.id, { packId, status: "preparing" });
      onValidated(saved);
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-2xl p-6 ${glass} !bg-ivory`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">
            Confirmer — {order.groom_name} & {order.bride_name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-lg border border-gold/40 px-2.5 py-1 text-sm text-ink/60 hover:bg-ivory-dark"
          >
            ✕
          </button>
        </div>
        <p className="mb-4 text-sm text-ink/55">
          Quel pack le client a-t-il choisi ? La commande passera en préparation.
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          {PRICING.map((p) => {
            const selected = packId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setPackId(p.id);
                  setError("");
                }}
                className={`rounded-2xl border-2 bg-white p-4 text-left transition-all ${
                  selected ? "border-burgundy shadow-royal" : "border-gold/25 hover:border-gold/60"
                }`}
              >
                <p className="text-sm font-semibold text-burgundy-dark">{p.name.fr}</p>
                <p className="mt-1 font-serif text-xl font-bold text-ink tabular-nums">
                  {formatDZD(p.price, "fr")}
                </p>
                <ul className="mt-2 space-y-1 text-[0.7rem] leading-snug text-ink/55">
                  {p.features.fr.slice(0, 3).map((f, i) => (
                    <li key={i}>• {f}</li>
                  ))}
                </ul>
                {selected ? (
                  <p className="mt-2 text-xs font-bold text-emerald">✓ Sélectionné</p>
                ) : null}
              </button>
            );
          })}
        </div>

        {error && <p className="mt-3 text-sm text-burgundy">{error}</p>}

        <button
          type="button"
          disabled={busy}
          onClick={validate}
          className="mt-5 w-full rounded-xl bg-emerald px-5 py-3 text-sm font-bold text-white transition-colors hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "…" : "✔ Valider → En préparation"}
        </button>
      </div>
    </div>
  );
}

function RowDetails({
  order: o,
  wa,
  pack,
  patchOrder,
  applySaved,
  onConfirm,
  onFillInfos,
  onDispatch,
  onCancel,
  onDelete,
}) {
  const [motif, setMotif] = useState(o.confirmation_status || "");
  const [comment, setComment] = useState(o.comment || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedTick, setSavedTick] = useState(false);
  const [packSaving, setPackSaving] = useState(false);

  /* تغيير الباقة من بطاقة Commande — يُحفظ فورًا دون تغيير الحالة */
  async function changePack(packId) {
    setPackSaving(true);
    setError("");
    try {
      const saved = await patchOrder(o.id, { packId });
      applySaved(saved);
    } catch (e) {
      setError(e.message);
    } finally {
      setPackSaving(false);
    }
  }

  async function saveFollowUp() {
    setSaving(true);
    setError("");
    try {
      const saved = await patchOrder(o.id, { confirmationStatus: motif, comment });
      applySaved(saved);
      setSavedTick(true);
      setTimeout(() => setSavedTick(false), 1600);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const card = "rounded-2xl border border-gold/25 bg-white/70 p-4";
  const heading = "mb-3 text-xs font-bold uppercase tracking-wider text-ink/50";
  const input =
    "w-full rounded-lg border border-gold/40 bg-white px-3 py-2 text-sm outline-none focus:border-burgundy";

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        {/* بطاقة معلومات الزبون */}
        <section className={card}>
          <h3 className={heading}>Informations client</h3>
          <ul className="space-y-1.5 text-sm text-ink/80">
            <li className="font-semibold text-ink">
              👤 {o.groom_name} & {o.bride_name}
            </li>
            <li className="flex items-center gap-2">
              📞 <span dir="ltr" className="tabular-nums">{o.phone}</span>
              <CopyButton text={o.phone} />
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border border-emerald/40 px-2 py-0.5 text-xs text-emerald hover:bg-emerald/10"
                >
                  WhatsApp
                </a>
              )}
            </li>
            <li>📅 {o.wedding_date || <span className="text-ink/40">date non fournie</span>}</li>
            <li>📍 {o.venue || <span className="text-ink/40">lieu non fourni</span>}</li>
            <li>
              🌐 {o.lang === "ar" ? "Arabe" : "Français"} · reçue le{" "}
              {(o.created_at || "").slice(0, 16).replace("T", " ")}
            </li>
            {o.wedding_id ? (
              <li>
                💍 Mariage lié :{" "}
                <span className="font-semibold text-emerald">{o.wedding_id}</span>
              </li>
            ) : null}
          </ul>

          {/* معلومات التسليم للزبون: رابط الدعوة + لوحة المتابعة + كلمة السر
              — تظهر فقط بعد اكتمال المعلومات (Infos complètes) */}
          {o.wedding_id && o.infos_complete ? (
            <div className="mt-3 space-y-1.5 rounded-xl bg-ivory-light p-3 text-xs text-ink/75">
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-ink/45">
                Accès du client
              </p>
              <p className="flex flex-wrap items-center gap-1.5">
                🔗 Invitation :
                <a
                  href={`/w/${o.wedding_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  dir="ltr"
                  className="font-semibold text-burgundy underline-offset-4 hover:underline"
                >
                  /w/{o.wedding_id}
                </a>
                <CopyButton
                  text={`${typeof window !== "undefined" ? window.location.origin : ""}/w/${o.wedding_id}`}
                />
              </p>
              <p className="flex flex-wrap items-center gap-1.5">
                📊 Dashboard :
                <a
                  href={`/dashboard/${o.wedding_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  dir="ltr"
                  className="font-semibold text-burgundy underline-offset-4 hover:underline"
                >
                  /dashboard/{o.wedding_id}
                </a>
                <CopyButton
                  text={`${typeof window !== "undefined" ? window.location.origin : ""}/dashboard/${o.wedding_id}`}
                />
              </p>
              {o.dashboard_password ? (
                <p className="flex flex-wrap items-center gap-1.5">
                  🔑 Mot de passe :
                  <code dir="ltr" className="rounded bg-white px-1.5 py-0.5 font-bold text-ink">
                    {o.dashboard_password}
                  </code>
                  <CopyButton text={o.dashboard_password} />
                </p>
              ) : null}
            </div>
          ) : null}
        </section>

        {/* متابعة التأكيد: motif + تعليق */}
        <section className={card}>
          <h3 className={heading}>Statut de confirmation</h3>
          <select className={input} value={motif} onChange={(e) => setMotif(e.target.value)}>
            <option value="">Sélectionner un motif</option>
            {MOTIFS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <textarea
            rows={3}
            className={`${input} mt-2 resize-none`}
            placeholder="Votre commentaire…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          {error && <p className="mt-2 text-xs text-burgundy">{error}</p>}
          <button
            type="button"
            disabled={saving}
            onClick={saveFollowUp}
            className="mt-2 rounded-lg border border-gold/50 px-4 py-2 text-xs font-semibold text-gold-dark transition-colors hover:bg-ivory-dark disabled:opacity-60"
          >
            {saving ? "…" : savedTick ? "✓ Enregistré" : "Enregistrer"}
          </button>
        </section>

        {/* ملخص الطلب — الباقة قابلة للتغيير مباشرة من هنا */}
        <section className={card}>
          <h3 className={heading}>Commande</h3>
          <ul className="space-y-1.5 text-sm text-ink/80">
            <li>
              🖼 Modèle : <span className="font-semibold">{templateName(o.template_id)}</span>
            </li>
            <li>
              <label className="mb-1 block text-xs text-ink/50">📦 Pack</label>
              <select
                className={input}
                value={o.pack_id || ""}
                disabled={packSaving}
                onChange={(e) => changePack(e.target.value)}
              >
                <option value="">— non choisi —</option>
                {PRICING.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name.fr} — {formatDZD(p.price, "fr")}
                  </option>
                ))}
              </select>
            </li>
            {pack ? (
              <li className="mt-2 flex items-baseline justify-between rounded-xl bg-ivory-light px-3 py-2">
                <span className="text-xs uppercase tracking-wider text-ink/50">Total</span>
                <span className="font-serif text-lg font-bold text-burgundy-dark tabular-nums">
                  {packSaving ? "…" : formatDZD(pack.price, "fr")}
                </span>
              </li>
            ) : null}
          </ul>
        </section>
      </div>

      {/* أزرار الإجراءات (نمط EcoManager) */}
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-rose-700"
        >
          🗑 Supprimer
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg bg-ink/70 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-ink"
        >
          ✖ Annuler
        </button>
        {o.status === "new" && (
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-emerald px-5 py-2 text-xs font-semibold text-white transition-colors hover:opacity-90"
          >
            ✔ Confirmer
          </button>
        )}
        {o.status === "preparing" && (
          <>
            <button
              type="button"
              onClick={onFillInfos}
              className="rounded-lg bg-burgundy px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-burgundy-dark"
            >
              📋 Saisir les infos du client
            </button>
            <button
              type="button"
              onClick={onDispatch}
              className="rounded-lg bg-violet-600 px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-violet-700"
            >
              → Dispatch
            </button>
          </>
        )}
      </div>
    </div>
  );
}
