"use client";

import { useEffect, useState } from "react";
import { OwnerGate, OwnerLayout, ownerHeaders, OWNER_PASS_KEY } from "./shared";
import WeddingWizard from "./WeddingWizard";
import { rowToForm } from "./formModel";

export default function OwnerEdit({ weddingId, embed = false }) {
  const [granted, setGranted] = useState(false);
  const [wedding, setWedding] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function load() {
    const res = await fetch(`/api/owner/weddings/${encodeURIComponent(weddingId)}`, {
      headers: ownerHeaders(),
    });
    if (res.status === 401) return setGranted(false);
    setGranted(true);
    if (res.ok) setWedding((await res.json()).wedding);
    else setError("Mariage introuvable.");
  }

  useEffect(() => {
    if (sessionStorage.getItem(OWNER_PASS_KEY)) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weddingId]);

  async function save(body) {
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch(`/api/owner/weddings/${encodeURIComponent(weddingId)}`, {
        method: "PUT",
        headers: { ...ownerHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "erreur serveur");
      setSaved(true);
      setWedding(json.wedding);
      /* وضع embed (صفحة Saisir les infos داخل لوحة الطلبات):
         نُخطر الصفحة الأم أن المعلومات اكتملت — فتغلق النافذة
         وتُعلّم الطلبية كمكتملة، مع تمرير كلمة السر إن غُيّرت. */
      if (embed && typeof window !== "undefined" && window.parent !== window) {
        window.parent.postMessage(
          {
            type: "dawati-infos-saved",
            weddingId,
            dashboardPassword: body.dashboardPassword || null,
          },
          window.location.origin
        );
      }
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setBusy(false);
    }
  }

  if (!granted) return <OwnerGate onGranted={() => load()} />;

  const content = (
    <>
      {saved && (
        <p className="mb-4 rounded-xl border border-gold bg-ivory-light px-4 py-2 text-sm text-ink">
          ✓ Modifications enregistrées.{" "}
          <a
            href={`/w/${weddingId}`}
            target="_blank"
            rel="noreferrer"
            className="text-burgundy underline-offset-4 hover:underline"
          >
            Voir l'invitation
          </a>
        </p>
      )}
      {!wedding && !error && <p className="py-8 text-center text-ink/55">Chargement…</p>}
      {error && !wedding && <p className="py-8 text-center text-burgundy">{error}</p>}
      {wedding && (
        <WeddingWizard
          key={wedding.updated_at}
          initial={rowToForm(wedding)}
          onFinish={save}
          finishLabel="✓ Enregistrer"
          requirePassword={false}
          busy={busy}
          error={error}
        />
      )}
    </>
  );

  /* وضع embed: صفحة ملء بيانات مركّزة — بلا قائمة جانبية ولا شريط علوي.
     تُفتح من زر «Saisir les infos» في لوحة الطلبات داخل النافذة الفوقية. */
  if (embed) {
    const coupleName = wedding
      ? wedding.display_name || `${wedding.groom_name} & ${wedding.bride_name}`
      : weddingId;
    return (
      <main className="min-h-screen bg-gradient-to-b from-ivory to-ivory-dark/30 px-4 py-6 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-gold/25 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/50 bg-white font-monogram text-xl text-burgundy shadow-sm">
                {(coupleName || "D").charAt(0)}
              </span>
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-gold-dark">
                  Fiche client — {weddingId}
                </p>
                <h1 className="font-serif text-xl font-bold text-burgundy-dark">{coupleName}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {wedding?.wedding_date && (
                <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold-dark">
                  📅 {wedding.wedding_date}
                </span>
              )}
              <a
                href={`/w/${weddingId}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-burgundy/40 px-3.5 py-1.5 text-xs font-semibold text-burgundy transition-colors hover:bg-burgundy hover:text-white"
              >
                👁 Voir l'invitation
              </a>
            </div>
          </header>
          <p className="mb-5 text-sm text-ink/55">
            Remplissez toutes les informations envoyées par le client, étape par étape, puis
            cliquez sur « ✓ Enregistrer » à la dernière étape.
          </p>
          {content}
        </div>
      </main>
    );
  }

  return (
    <OwnerLayout active="/owner/weddings" title={`Modifier — ${weddingId}`}>
      {content}
    </OwnerLayout>
  );
}
