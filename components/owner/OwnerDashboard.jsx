"use client";

import { useEffect, useState } from "react";
import WeddingForm, { rowToForm } from "./WeddingForm";

export const OWNER_PASS_KEY = "owner-pass";

export function ownerHeaders() {
  return { "x-owner-password": sessionStorage.getItem(OWNER_PASS_KEY) || "" };
}

/** simple professional shell for the owner pages */
export function OwnerShell({ children, title }) {
  return (
    <main className="min-h-screen bg-ivory px-4 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-ink">{title}</h1>
          <a href="/owner" className="text-sm text-gold-dark underline-offset-4 hover:underline">
            ← Tableau de bord
          </a>
        </header>
        {children}
      </div>
    </main>
  );
}

export function OwnerGate({ onGranted }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function tryLogin(e) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/owner/weddings", {
      headers: { "x-owner-password": password },
    });
    if (res.status === 401) return setError("Mot de passe incorrect.");
    if (res.status === 503) {
      const body = await res.json().catch(() => ({}));
      return setError(
        body.error?.includes("OWNER_PASSWORD")
          ? "OWNER_PASSWORD n'est pas défini dans .env.local."
          : "Supabase n'est pas configuré côté serveur."
      );
    }
    sessionStorage.setItem(OWNER_PASS_KEY, password);
    onGranted(await res.json());
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-4">
      <form onSubmit={tryLogin} className="w-full max-w-xs space-y-4 rounded-2xl border border-gold/30 bg-ivory-light p-6 shadow-card">
        <h1 className="text-center text-xl font-semibold text-ink">Espace propriétaire</h1>
        <input
          type="password"
          required
          autoFocus
          placeholder="OWNER_PASSWORD"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-gold/40 bg-white px-3 py-2 text-sm outline-none focus:border-burgundy"
        />
        {error && <p className="text-sm text-burgundy">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-xl bg-burgundy px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-white hover:bg-burgundy-dark"
        >
          Entrer
        </button>
      </form>
    </main>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="rounded-md border border-gold/50 px-2 py-0.5 text-xs text-gold-dark hover:bg-ivory-dark"
    >
      {copied ? "✓ copié" : "copier"}
    </button>
  );
}

const EMPTY_FORM = rowToForm({});

export default function OwnerDashboard() {
  const [granted, setGranted] = useState(false);
  const [rows, setRows] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/owner/weddings", { headers: ownerHeaders() });
    if (!res.ok) {
      setGranted(false);
      return;
    }
    setGranted(true);
    const { rows } = await res.json();
    setRows(rows);
  }

  useEffect(() => {
    if (sessionStorage.getItem(OWNER_PASS_KEY)) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createWedding(body) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/owner/weddings", {
        method: "POST",
        headers: { ...ownerHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "erreur");
      setCreated(json);
      setShowCreate(false);
      load();
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setBusy(false);
    }
  }

  async function removeWedding(weddingId) {
    if (!window.confirm(`Supprimer le mariage ${weddingId} et toutes ses réponses ?`)) return;
    await fetch(`/api/owner/weddings/${encodeURIComponent(weddingId)}`, {
      method: "DELETE",
      headers: ownerHeaders(),
    });
    load();
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
    <OwnerShell title="Mariages">
      {/* result of the last creation: links + password to hand the client */}
      {created && (
        <div className="mb-6 space-y-2 rounded-2xl border border-gold bg-ivory-light p-5 shadow-card">
          <p className="font-semibold text-ink">
            ✓ Mariage créé : {created.wedding.display_name} — {created.wedding.wedding_id}
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
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink/60">{rows ? `${rows.length} mariage(s)` : "Chargement…"}</p>
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="rounded-xl bg-burgundy px-4 py-2 text-sm font-semibold text-white hover:bg-burgundy-dark"
        >
          {showCreate ? "Fermer" : "+ Nouveau mariage"}
        </button>
      </div>

      {error && <p className="mb-3 text-sm text-burgundy">{error}</p>}

      {showCreate && (
        <div className="mb-6 rounded-2xl border border-gold/30 bg-white/60 p-4">
          <WeddingForm
            initial={EMPTY_FORM}
            onSubmit={createWedding}
            submitLabel="Créer le mariage"
            requirePassword
            busy={busy}
          />
        </div>
      )}

      <div className="space-y-2">
        {(rows || []).map((w) => (
          <div
            key={w.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gold/30 bg-ivory-light px-4 py-3"
          >
            <div>
              <p className="font-semibold text-ink">
                {w.display_name || `${w.groom_name} & ${w.bride_name}`}{" "}
                <span className="font-normal text-ink/50">· {w.wedding_id}</span>
              </p>
              <p className="text-xs text-ink/55">
                {w.wedding_date || "date non définie"} · créé le{" "}
                {new Date(w.created_at).toLocaleDateString("fr-FR")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <a className="text-gold-dark underline-offset-4 hover:underline" href={`/w/${w.wedding_id}`} target="_blank" rel="noreferrer">
                invitation
              </a>
              <CopyButton text={`${origin}/w/${w.wedding_id}`} />
              <a className="text-gold-dark underline-offset-4 hover:underline" href={`/dashboard/${w.wedding_id}`} target="_blank" rel="noreferrer">
                dashboard
              </a>
              <CopyButton text={`${origin}/dashboard/${w.wedding_id}`} />
              <a
                className="rounded-md border border-gold/50 px-2 py-0.5 text-xs text-gold-dark hover:bg-ivory-dark"
                href={`/owner/weddings/${w.wedding_id}/edit`}
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
        ))}
        {rows && rows.length === 0 && (
          <p className="py-8 text-center text-ink/55">Aucun mariage — créez le premier !</p>
        )}
      </div>
    </OwnerShell>
  );
}
