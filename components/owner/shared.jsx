"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export const OWNER_PASS_KEY = "owner-pass";
export const STAFF_USER_KEY = "staff-user";
export const STAFF_PASS_KEY = "staff-pass";
export const SESSION_KEY = "owner-session"; // JSON: { role, displayName, permissions }

export function ownerHeaders() {
  const h = {};
  const ownerPass = sessionStorage.getItem(OWNER_PASS_KEY);
  if (ownerPass) h["x-owner-password"] = ownerPass;
  const staffUser = sessionStorage.getItem(STAFF_USER_KEY);
  const staffPass = sessionStorage.getItem(STAFF_PASS_KEY);
  if (staffUser && staffPass) {
    h["x-staff-user"] = staffUser;
    h["x-staff-password"] = staffPass;
  }
  return h;
}

export function hasStoredCredentials() {
  return Boolean(
    sessionStorage.getItem(OWNER_PASS_KEY) ||
      (sessionStorage.getItem(STAFF_USER_KEY) && sessionStorage.getItem(STAFF_PASS_KEY))
  );
}

/** جلسة الدخول الحالية { role, displayName, permissions } أو null */
export function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

function clearCredentials() {
  sessionStorage.removeItem(OWNER_PASS_KEY);
  sessionStorage.removeItem(STAFF_USER_KEY);
  sessionStorage.removeItem(STAFF_PASS_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

/* بطاقة موحّدة لكل صفحات الإدارة — نمط SaaS نظيف على خلفية رمادية فاتحة */
export const glass = "rounded-xl border border-stone-200 bg-white shadow-sm";

/* wedding status derived from its date + archive flag */
export function statusOf(w) {
  if (w.archived) return { label: "archivé", cls: "bg-ink/10 text-ink/50" };
  if (!w.wedding_date) return { label: "sans date", cls: "bg-ink/10 text-ink/60" };
  const today = new Date().toISOString().slice(0, 10);
  if (w.wedding_date >= today) return { label: "à venir", cls: "bg-gold/20 text-gold-dark" };
  return { label: "passé", cls: "bg-stone-200 text-stone-700" };
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

/* password gate for the whole owner area — dark professional.
   عند وجود جلسة محفوظة: شاشة تحقق هادئة بلون المحتوى بدل وميض
   صفحة الدخول عند كل تنقل بين الأقسام. */
export function OwnerGate({ onGranted }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!hasStoredCredentials()) return setChecking(false);
    let alive = true;
    fetch("/api/owner/login", { headers: ownerHeaders() })
      .then(async (res) => {
        if (!alive) return;
        if (res.ok) {
          const session = await res.json();
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
          return onGranted(session);
        }
        clearCredentials();
        setChecking(false);
      })
      .catch(() => alive && setChecking(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-100 font-sans">
        <div className="flex flex-col items-center gap-3">
          <span className="flex h-12 w-12 animate-pulse items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold-dark font-monogram text-xl text-white shadow">
            D
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-400">
            Chargement…
          </span>
        </div>
      </main>
    );
  }

  async function tryLogin(e) {
    e.preventDefault();
    setError("");
    /* اسم مستخدم فارغ = دخول المالك؛ وإلا دخول عامل */
    const user = username.trim().toLowerCase();
    const headers = user
      ? { "x-staff-user": user, "x-staff-password": password }
      : { "x-owner-password": password };
    const res = await fetch("/api/owner/login", { headers });
    if (res.status === 401) return setError("Identifiants incorrects.");
    if (res.status === 503) {
      const body = await res.json().catch(() => ({}));
      return setError(
        body.error?.includes("OWNER_PASSWORD")
          ? "OWNER_PASSWORD n'est pas défini côté serveur."
          : "Supabase n'est pas configuré côté serveur."
      );
    }
    if (!res.ok) return setError("Erreur serveur.");
    const session = await res.json();
    clearCredentials();
    if (user) {
      sessionStorage.setItem(STAFF_USER_KEY, user);
      sessionStorage.setItem(STAFF_PASS_KEY, password);
    } else {
      sessionStorage.setItem(OWNER_PASS_KEY, password);
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    onGranted(session);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-950 px-4 font-sans">
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
            Espace équipe
          </h1>
        </div>
        <input
          type="text"
          autoFocus
          autoComplete="username"
          placeholder="Identifiant employé (vide = propriétaire)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          dir="ltr"
          className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-sm text-stone-100 outline-none transition-colors placeholder:text-stone-600 focus:border-gold"
        />
        <input
          type="password"
          required
          autoComplete="current-password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-sm text-stone-100 outline-none transition-colors placeholder:text-stone-600 focus:border-gold"
        />
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-xl bg-gradient-to-r from-stone-800 to-stone-950 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
        >
          Entrer
        </button>
      </form>
    </main>
  );
}

/* perm: صلاحية القسم في staff_users.permissions — null = يظهر للجميع،
   ownerOnly: للمالك فقط */
const NAV = [
  { href: "/owner", label: "Dashboard", icon: "🏠", perm: "analytics" },
  { href: "/owner/weddings", label: "Mariages", icon: "💍", perm: "weddings" },
  { href: "/owner/weddings/new", label: "Créer un mariage", icon: "➕", perm: "weddings" },
  { href: "/owner/orders", label: "Commandes", icon: "🛒", perm: "orders" },
  { href: "/owner/templates", label: "Modèles", icon: "🖼", perm: "templates" },
  { href: "/owner/media", label: "Médiathèque", icon: "📁", perm: "media" },
  { href: "/owner/music", label: "Musiques", icon: "🎵", perm: "music" },
  { href: "/owner/analytics", label: "Statistiques", icon: "📊", perm: "analytics" },
  { href: "/owner/staff", label: "Équipe", icon: "👥", ownerOnly: true },
  { href: "/owner/settings", label: "Paramètres", icon: "⚙️", perm: "settings" },
];

/* شاشة «لا صلاحية» — تعرضها الصفحات عند ردّ 403 لعامل بلا صلاحية القسم */
export function AccessDenied() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 px-4 font-sans">
      <div className="max-w-sm rounded-xl border border-stone-200 bg-white p-8 text-center shadow-sm">
        <span className="text-4xl">🔒</span>
        <h1 className="mt-3 text-lg font-bold text-stone-900">Accès non autorisé</h1>
        <p className="mt-2 text-sm text-stone-500">
          Votre compte n'a pas la permission d'accéder à cette section. Contactez le
          propriétaire pour ajuster vos droits.
        </p>
        <Link
          href="/owner/orders"
          className="mt-5 inline-block rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-700"
        >
          ← Retour
        </Link>
      </div>
    </main>
  );
}

/* SaaS admin shell — قائمة داكنة + محتوى فاتح نظيف */
export function OwnerLayout({ children, active, title, actions }) {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  /* المالك (أو قبل تحميل الجلسة) يرى كل شيء — العامل يرى أقسامه فقط */
  const visibleNav = NAV.filter((item) => {
    if (!session) return true;
    if (session.role === "owner") return true;
    if (item.ownerOnly) return false;
    return !item.perm || session.permissions?.[item.perm];
  });

  const canCreate = !session || session.role === "owner" || session.permissions?.weddings;

  const nav = (
    <nav className="space-y-0.5">
      {visibleNav.map((item) => {
        const isActive = active === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch
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
          </Link>
        );
      })}
    </nav>
  );

  return (
    <main className="min-h-screen bg-stone-100 font-sans md:pl-60">
      {/* sidebar — داكن ثابت على المكتب، منزلق على الجوال */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-stone-900 p-4 transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link href="/owner" prefetch className="mb-6 flex items-center gap-3 px-2 pt-1">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold-dark font-monogram text-xl text-white shadow">
            D
          </span>
          <span>
            <span className="block font-monogram text-2xl leading-none text-gold">Dawati</span>
            <span className="block text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-stone-500">
              admin
            </span>
          </span>
        </Link>
        <div className="flex-1 overflow-y-auto">{nav}</div>
        {/* المستخدم الحالي + تسجيل الخروج */}
        <div className="mt-4 border-t border-stone-800 px-2 pt-3">
          <div className="flex items-center justify-between gap-2">
            <span className="min-w-0">
              <span className="block truncate text-xs font-semibold text-stone-300">
                {session?.displayName || "…"}
              </span>
              <span className="block text-[0.6rem] uppercase tracking-wider text-stone-600">
                {session?.role === "staff" ? "employé" : "propriétaire"}
              </span>
            </span>
            <button
              type="button"
              title="Déconnexion"
              onClick={() => {
                sessionStorage.removeItem(OWNER_PASS_KEY);
                sessionStorage.removeItem(STAFF_USER_KEY);
                sessionStorage.removeItem(STAFF_PASS_KEY);
                sessionStorage.removeItem(SESSION_KEY);
                window.location.href = "/owner";
              }}
              className="rounded-lg border border-stone-700 px-2 py-1 text-xs text-stone-400 transition-colors hover:border-rose-500 hover:text-rose-400"
            >
              ⎋
            </button>
          </div>
          <p className="mt-2 text-[0.65rem] text-stone-600">
            © {new Date().getFullYear()} Dawati
          </p>
        </div>
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
            {canCreate && (
              <Link
                href="/owner/weddings/new"
                prefetch
                className="rounded-lg bg-stone-900 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-stone-700 hover:shadow"
              >
                + Créer
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="px-5 py-6">{children}</div>
    </main>
  );
}
