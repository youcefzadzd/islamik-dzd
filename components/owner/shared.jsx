"use client";

import { useState } from "react";

export const OWNER_PASS_KEY = "owner-pass";

export function ownerHeaders() {
  return { "x-owner-password": sessionStorage.getItem(OWNER_PASS_KEY) || "" };
}

/* one glass card style for the whole admin */
export const glass =
  "rounded-2xl border border-gold/25 bg-white/60 shadow-card backdrop-blur-md";

/* wedding status derived from its date + archive flag */
export function statusOf(w) {
  if (w.archived) return { label: "archivé", cls: "bg-ink/10 text-ink/50" };
  if (!w.wedding_date) return { label: "sans date", cls: "bg-ink/10 text-ink/60" };
  const today = new Date().toISOString().slice(0, 10);
  if (w.wedding_date >= today) return { label: "à venir", cls: "bg-gold/20 text-gold-dark" };
  return { label: "passé", cls: "bg-burgundy/10 text-burgundy" };
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr + "T00:00:00") - new Date()) / 86400000);
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
      className="rounded-md border border-gold/50 px-2 py-0.5 text-xs text-gold-dark transition-colors hover:bg-ivory-dark"
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
      <form onSubmit={tryLogin} className={`w-full max-w-xs space-y-4 p-6 ${glass}`}>
        <p className="text-center font-monogram text-3xl text-gold-dark">Invitations Royales</p>
        <h1 className="text-center text-sm uppercase tracking-[0.2em] text-ink/60">
          Espace propriétaire
        </h1>
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
          className="w-full rounded-xl bg-burgundy px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-burgundy-dark"
        >
          Entrer
        </button>
      </form>
    </main>
  );
}

const NAV = [
  { href: "/owner", label: "Dashboard", icon: "🏠" },
  { href: "/owner/weddings", label: "Mariages", icon: "💍" },
  { href: "/owner/weddings/new", label: "Créer un mariage", icon: "➕" },
  { href: "/owner/orders", label: "Commandes", icon: "🛒" },
  { href: "/owner/templates", label: "Modèles", icon: "🖼" },
  { href: "/owner/media", label: "Médiathèque", icon: "📁" },
  { href: "/owner/music", label: "Musiques", icon: "🎵" },
  { href: "/owner/analytics", label: "Statistiques", icon: "📊" },
  { href: "/owner/settings", label: "Paramètres", icon: "⚙️" },
];

/* SaaS admin shell: left sidebar + top bar + content */
export function OwnerLayout({ children, active, title, actions }) {
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="space-y-1">
      {NAV.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
            active === item.href
              ? "bg-burgundy text-white shadow-card"
              : "text-ink/75 hover:bg-white/70"
          }`}
        >
          <span className="w-5 text-center">{item.icon}</span>
          {item.label}
        </a>
      ))}
    </nav>
  );

  return (
    <main className="min-h-screen bg-ivory md:pl-60">
      {/* sidebar — fixed on desktop, slide-over on mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 border-r border-gold/25 bg-ivory-light/90 p-4 backdrop-blur-md transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <a href="/owner" className="mb-6 block px-2">
          <p className="font-monogram text-2xl text-gold-dark">Invitations Royales</p>
          <p className="text-[0.65rem] uppercase tracking-[0.25em] text-ink/45">admin</p>
        </a>
        {nav}
        <p className="absolute bottom-4 left-4 right-4 text-[0.65rem] text-ink/35">
          © {new Date().getFullYear()} — plateforme privée
        </p>
      </aside>
      {open && (
        <button
          aria-label="Fermer le menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-ink/30 md:hidden"
        />
      )}

      {/* top bar */}
      <header className="sticky top-0 z-20 border-b border-gold/25 bg-ivory/85 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Menu"
              onClick={() => setOpen(true)}
              className="rounded-lg border border-gold/40 px-2.5 py-1.5 text-sm text-gold-dark md:hidden"
            >
              ☰
            </button>
            <h1 className="text-lg font-semibold text-ink">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {actions}
            <a
              href="/owner/weddings/new"
              className="rounded-xl bg-burgundy px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-burgundy-dark"
            >
              + Créer
            </a>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">{children}</div>
    </main>
  );
}
