"use client";

import { useState } from "react";

export const OWNER_PASS_KEY = "owner-pass";

export function ownerHeaders() {
  return { "x-owner-password": sessionStorage.getItem(OWNER_PASS_KEY) || "" };
}

/* wedding status derived from its date */
export function statusOf(w) {
  if (!w.wedding_date) return { label: "sans date", cls: "bg-ink/10 text-ink/60" };
  const today = new Date().toISOString().slice(0, 10);
  if (w.wedding_date >= today) return { label: "à venir", cls: "bg-gold/20 text-gold-dark" };
  return { label: "passé", cls: "bg-burgundy/10 text-burgundy" };
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr + "T00:00:00") - new Date()) / 86400000);
  return diff;
}

export function CopyButton({ text, label = "copier" }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      title={text}
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="rounded-md border border-gold/50 px-2 py-0.5 text-xs text-gold-dark hover:bg-ivory-dark"
    >
      {copied ? "✓" : label}
    </button>
  );
}

/* password gate for the whole owner area */
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
          ? "OWNER_PASSWORD n'est pas défini côté serveur."
          : "Supabase n'est pas configuré côté serveur."
      );
    }
    if (!res.ok) return setError("Erreur serveur.");
    sessionStorage.setItem(OWNER_PASS_KEY, password);
    onGranted(await res.json());
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-4">
      <form
        onSubmit={tryLogin}
        className="w-full max-w-xs space-y-4 rounded-2xl border border-gold/30 bg-ivory-light p-6 shadow-card"
      >
        <h1 className="text-center text-xl font-semibold text-ink">Espace propriétaire</h1>
        <input
          type="password"
          required
          autoFocus
          placeholder="Mot de passe"
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

const NAV = [
  { href: "/owner", label: "Tableau de bord", icon: "◆" },
  { href: "/owner/weddings", label: "Mariages", icon: "💍" },
  { href: "/owner/weddings/new", label: "Nouveau", icon: "＋" },
  { href: "/owner/settings", label: "Paramètres", icon: "⚙" },
];

/* the owner shell: gold header + navigation, responsive */
export function OwnerLayout({ children, active, title }) {
  return (
    <main className="min-h-screen bg-ivory">
      <header className="border-b border-gold/25 bg-ivory-light">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <p className="font-monogram text-2xl text-gold-dark">Invitations Royales</p>
          <nav className="flex flex-wrap gap-1">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  active === item.href
                    ? "bg-burgundy text-white"
                    : "text-ink/75 hover:bg-ivory-dark"
                }`}
              >
                <span className="mr-1 hidden sm:inline">{item.icon}</span>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        {title && <h1 className="mb-5 text-2xl font-semibold text-ink">{title}</h1>}
        {children}
      </div>
    </main>
  );
}
