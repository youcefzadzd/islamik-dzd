"use client";

import { useEffect, useState } from "react";
import { OwnerGate, OwnerLayout, ownerHeaders, CopyButton, OWNER_PASS_KEY } from "./shared";
import WeddingWizard from "./WeddingWizard";
import { rowToForm } from "./formModel";

export default function WeddingCreate() {
  const [granted, setGranted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);

  useEffect(() => {
    if (sessionStorage.getItem(OWNER_PASS_KEY)) {
      fetch("/api/owner/weddings", { headers: ownerHeaders() }).then((r) => setGranted(r.ok));
    }
  }, []);

  async function create(body) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/owner/weddings", {
        method: "POST",
        headers: { ...ownerHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "erreur serveur");
      setCreated(json);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setBusy(false);
    }
  }

  if (!granted) return <OwnerGate onGranted={() => setGranted(true)} />;

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  if (created) {
    return (
      <OwnerLayout active="/owner/weddings/new" title="Mariage créé ✓">
        <div className="space-y-2 rounded-2xl border border-gold bg-ivory-light p-5 shadow-card">
          <p className="font-semibold text-ink">
            {created.wedding.display_name} — {created.wedding.wedding_id}
          </p>
          {[
            ["Invitation", `${origin}${created.links.invitation}`],
            ["Dashboard client", `${origin}${created.links.dashboard}`],
            ["Mot de passe client", created.dashboardPassword],
          ].map(([label, value]) => (
            <p key={label} className="flex flex-wrap items-center gap-2 text-sm text-ink/85">
              <span className="w-36 shrink-0 text-ink/55">{label}</span>
              <code className="rounded bg-white px-2 py-0.5">{value}</code>
              <CopyButton text={value} />
            </p>
          ))}
          <p className="text-xs text-ink/50">
            Notez le mot de passe maintenant — il est stocké chiffré et ne pourra plus être affiché.
          </p>
          <div className="flex gap-2 pt-2">
            <a
              href={`/w/${created.wedding.wedding_id}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-burgundy px-4 py-2 text-sm font-semibold text-white hover:bg-burgundy-dark"
            >
              Voir l'invitation
            </a>
            <a
              href="/owner/weddings"
              className="rounded-xl border border-gold/50 px-4 py-2 text-sm text-gold-dark hover:bg-ivory-dark"
            >
              Liste des mariages
            </a>
            <button
              type="button"
              onClick={() => setCreated(null)}
              className="rounded-xl border border-gold/50 px-4 py-2 text-sm text-gold-dark hover:bg-ivory-dark"
            >
              + Créer un autre
            </button>
          </div>
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout active="/owner/weddings/new" title="Nouveau mariage">
      <WeddingWizard
        initial={rowToForm({})}
        onFinish={create}
        finishLabel="✓ Créer le mariage"
        requirePassword
        busy={busy}
        error={error}
      />
    </OwnerLayout>
  );
}
