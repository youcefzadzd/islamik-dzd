"use client";

import { useState } from "react";

export const OWNER_PASS_KEY = "owner-pass";

export function ownerHeaders() {
  return { "x-owner-password": sessionStorage.getItem(OWNER_PASS_KEY) || "" };
}

/* بطاقة موحّدة لكل صفحات الإدارة — نمط SaaS نظيف على خلفية رمادية فاتحة */
export const glass = "rounded-xl border border-stone-200 bg-white shadow-sm";

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
      className="rounded-md border border-stone-300 px-2 py-0.5 text-xs text-stone-500 transition-colors hover:border-gold hover:text-gold-dark"
    >
      {copied ? "✓" : label}
    </button>
  );
}

/* password gate for the whole owner area — dark professional */
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
    <main className="flex min-h-screen items-center justify-center bg-stone-950 px-4">
      {/* توهج ذهبي خفيف خلف البطاقة */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-gold/10 blur-3xl" />
      </div>
      <form
        onSubmit={tryLogin}
        className="relative w-full max-w-sm space-y-5 rounded-2xl border border-stone-800 bg-stone-900 p-8 shadow-2xl"
      >
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gold to-gold-dark font-monogram text-2xl text-white shadow-lg">
            D
          </span>
          <p className="mt-4 font-monogram text-3xl text-gold">Dawati</p>
          <h1 className="mt-1 text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
            Espace propriétaire
          </h1>
        </div>
        <input
          type="password"
          required
          autoFocus
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-sm text-stone-100 outline-none transition-colors placeholder:text-stone-600 focus:border-gold"
        />
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-xl bg-gradient-to-r from-burgundy to-burgundy-dark px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
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

/* SaaS admin shell — قائمة داكنة + محتوى فاتح نظيف */
export function OwnerLayout({ children, active, title, actions }) {
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="space-y-0.5">
      {NAV.map((item) => {
        const isActive = active === item.href;
        return (
          <a
            key={item.href}
            href={item.href}
            className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              isActive
                ? "bg-stone-800 font-semibold text-white"
                : "text-stone-400 hover:bg-stone-800/60 hover:text-stone-100"
            }`}
          >
            {/* مؤشر ذهبي للعنصر النشط */}
            {isActive && (
              <span className="absolute inset-y-2 left-0 w-1 rounded-full bg-gold" aria-hidden />
            )}
            <span className="w-5 text-center text-base">{item.icon}</span>
            {item.label}
          </a>
        );
      })}
    </nav>
  );

  return (
    <main className="min-h-screen bg-stone-100 md:pl-60">
      {/* sidebar — داكن ثابت على المكتب، منزلق على الجوال */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-stone-900 p-4 transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <a href="/owner" className="mb-6 flex items-center gap-3 px-2 pt-1">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold-dark font-monogram text-xl text-white shadow">
            D
          </span>
          <span>
            <span className="block font-monogram text-2xl leading-none text-gold">Dawati</span>
            <span className="block text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-stone-500">
              admin
            </span>
          </span>
        </a>
        <div className="flex-1 overflow-y-auto">{nav}</div>
        <p className="mt-4 border-t border-stone-800 px-2 pt-3 text-[0.65rem] text-stone-600">
          © {new Date().getFullYear()} Dawati — plateforme privée
        </p>
      </aside>
      {open && (
        <button
          aria-label="Fermer le menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-stone-950/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* top bar — أبيض نظيف بظل خفيف */}
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 px-5 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Menu"
              onClick={() => setOpen(true)}
              className="rounded-lg border border-stone-300 px-2.5 py-1.5 text-sm text-stone-600 md:hidden"
            >
              ☰
            </button>
            <h1 className="text-lg font-bold tracking-tight text-stone-900">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {actions}
            <a
              href="/owner/weddings/new"
              className="rounded-lg bg-burgundy px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-burgundy-dark hover:shadow"
            >
              + Créer
            </a>
          </div>
        </div>
      </header>

      <div className="px-5 py-6">{children}</div>
    </main>
  );
}
