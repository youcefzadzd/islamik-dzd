"use client";

import { useEffect, useState } from "react";
import { OwnerGate, OwnerLayout, ownerHeaders, OWNER_PASS_KEY } from "./shared";
import WeddingWizard from "./WeddingWizard";
import { rowToForm } from "./formModel";

export default function OwnerEdit({ weddingId }) {
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
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setBusy(false);
    }
  }

  if (!granted) return <OwnerGate onGranted={() => load()} />;

  return (
    <OwnerLayout active="/owner/weddings" title={`Modifier — ${weddingId}`}>
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
    </OwnerLayout>
  );
}
