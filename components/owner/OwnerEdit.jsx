"use client";

import { useEffect, useState } from "react";
import WeddingForm, { rowToForm } from "./WeddingForm";
import { OwnerShell, OwnerGate, ownerHeaders, OWNER_PASS_KEY } from "./OwnerDashboard";

export default function OwnerEdit({ weddingId }) {
  const [granted, setGranted] = useState(false);
  const [initial, setInitial] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function load() {
    const res = await fetch(`/api/owner/weddings/${encodeURIComponent(weddingId)}`, {
      headers: ownerHeaders(),
    });
    if (res.status === 401 || res.status === 503) return setGranted(false);
    setGranted(true);
    if (res.status === 404) return setNotice("Mariage introuvable.");
    const { wedding } = await res.json();
    setInitial(rowToForm(wedding));
  }

  useEffect(() => {
    if (sessionStorage.getItem(OWNER_PASS_KEY)) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save(body) {
    setBusy(true);
    setNotice("");
    try {
      const res = await fetch(`/api/owner/weddings/${encodeURIComponent(weddingId)}`, {
        method: "PUT",
        headers: { ...ownerHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "erreur");
      setNotice("✓ Modifications enregistrées.");
    } catch (e) {
      setNotice("Erreur : " + String(e.message || e));
    } finally {
      setBusy(false);
    }
  }

  if (!granted) return <OwnerGate onGranted={() => load()} />;

  return (
    <OwnerShell title={`Modifier — ${weddingId}`}>
      {notice && <p className="mb-4 text-sm font-medium text-burgundy">{notice}</p>}
      {initial ? (
        <WeddingForm initial={initial} onSubmit={save} submitLabel="Enregistrer" busy={busy} />
      ) : (
        !notice && <p className="text-ink/60">Chargement…</p>
      )}
    </OwnerShell>
  );
}
