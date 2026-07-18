"use client";

import { useEffect, useState } from "react";
import {
  AccessDenied,
  OwnerGate,
  OwnerLayout,
  ownerHeaders,
  glass,
  hasStoredCredentials,
} from "./shared";

/* أقسام الصلاحيات — نفس مفاتيح ALL_PERMISSIONS في lib/staff-auth */
const PERMS = [
  { id: "orders", label: "Commandes", hint: "Suivi et confirmation des commandes du site" },
  { id: "weddings", label: "Mariages", hint: "Créer et modifier les invitations (Saisir les infos)" },
  { id: "media", label: "Médiathèque", hint: "Uploader photos et musiques (requis pour la saisie)" },
  { id: "music", label: "Musiques", hint: "Bibliothèque des musiques" },
  { id: "templates", label: "Modèles", hint: "Catalogue des modèles" },
  { id: "analytics", label: "Statistiques", hint: "Dashboard et statistiques" },
  { id: "settings", label: "Paramètres", hint: "Réglages du site (WhatsApp...)" },
];

const emptyForm = {
  id: null,
  email: "",
  displayName: "",
  password: "",
  active: true,
  permissions: {},
};

export default function StaffManager() {
  const [granted, setGranted] = useState(false);
  const [denied, setDenied] = useState(false);
  const [staff, setStaff] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState(null); // null = مغلق، وإلا نموذج إنشاء/تعديل
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");

  async function load() {
    setLoadError("");
    const res = await fetch("/api/owner/staff", { headers: ownerHeaders() });
    if (res.status === 401) return setGranted(false);
    if (res.status === 403) {
      setGranted(true);
      return setDenied(true);
    }
    setGranted(true);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStaff([]);
      return setLoadError(body.error || "Erreur serveur.");
    }
    setStaff(body.staff);
  }

  useEffect(() => {
    if (hasStoredCredentials()) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submitForm() {
    setFormError("");
    setBusy(true);
    try {
      const isNew = !form.id;
      const res = await fetch("/api/owner/staff", {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json", ...ownerHeaders() },
        body: JSON.stringify(
          isNew
            ? {
                email: form.email,
                displayName: form.displayName,
                password: form.password,
                permissions: form.permissions,
              }
            : {
                id: form.id,
                displayName: form.displayName,
                password: form.password || undefined,
                permissions: form.permissions,
                active: form.active,
              }
        ),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          body.error === "email already exists"
            ? "Cet email existe déjà."
            : body.error === "invalid email"
              ? "Email invalide (ex : ahmed@gmail.com)."
              : body.error === "invalid password"
                ? "Mot de passe invalide (6 caractères minimum)."
                : body.error || "Erreur serveur."
        );
      }
      setForm(null);
      load();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(u) {
    await fetch("/api/owner/staff", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...ownerHeaders() },
      body: JSON.stringify({ id: u.id, active: !u.active }),
    });
    load();
  }

  async function removeStaff(u) {
    if (!window.confirm(`Supprimer le compte « ${u.email} » définitivement ?`)) return;
    await fetch("/api/owner/staff", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...ownerHeaders() },
      body: JSON.stringify({ id: u.id }),
    });
    load();
  }

  if (!granted) return <OwnerGate onGranted={() => load()} />;
  if (denied) return <AccessDenied />;

  return (
    <OwnerLayout
      active="/owner/staff"
      title="Équipe"
      actions={
        <button
          type="button"
          onClick={() => setForm({ ...emptyForm })}
          className="rounded-lg bg-emerald px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:opacity-90"
        >
          + Ajouter un employé
        </button>
      }
    >
      {loadError && <p className={`mb-4 p-4 text-sm text-rose-600 ${glass}`}>{loadError}</p>}
      {!staff && !loadError && <p className="py-10 text-center text-stone-500">Chargement…</p>}

      {staff && staff.length === 0 && !loadError && (
        <div className={`p-10 text-center ${glass}`}>
          <span className="text-4xl">👥</span>
          <h2 className="mt-3 text-lg font-bold text-stone-900">Aucun employé pour le moment</h2>
          <p className="mt-1 text-sm text-stone-500">
            Créez un compte pour chaque employé et choisissez ses permissions section par section.
          </p>
          <button
            type="button"
            onClick={() => setForm({ ...emptyForm })}
            className="mt-5 rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-700"
          >
            + Ajouter un employé
          </button>
        </div>
      )}

      {staff?.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {staff.map((u) => (
            <section key={u.id} className={`p-5 ${glass} ${u.active ? "" : "opacity-60"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-stone-900 text-lg font-bold text-gold">
                    {(u.display_name || u.email).charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="font-bold text-stone-900">{u.display_name || u.email}</p>
                    <p dir="ltr" className="text-xs text-stone-500">{u.email}</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[0.65rem] font-bold ${
                    u.active ? "bg-emerald/10 text-emerald" : "bg-stone-200 text-stone-500"
                  }`}
                >
                  {u.active ? "Actif" : "Désactivé"}
                </span>
              </div>

              {/* الصلاحيات كشارات */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {PERMS.filter((p) => u.permissions?.[p.id]).map((p) => (
                  <span
                    key={p.id}
                    className="rounded-full bg-gold/15 px-2.5 py-1 text-[0.68rem] font-semibold text-gold-dark"
                  >
                    {p.label}
                  </span>
                ))}
                {!PERMS.some((p) => u.permissions?.[p.id]) && (
                  <span className="text-xs text-stone-400">Aucune permission</span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      id: u.id,
                      email: u.email,
                      displayName: u.display_name || "",
                      password: "",
                      active: u.active,
                      permissions: { ...(u.permissions || {}) },
                    })
                  }
                  className="rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-stone-700"
                >
                  ✎ Permissions & infos
                </button>
                <button
                  type="button"
                  onClick={() => toggleActive(u)}
                  className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  {u.active ? "⏸ Désactiver" : "▶ Activer"}
                </button>
                <button
                  type="button"
                  onClick={() => removeStaff(u)}
                  className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                >
                  🗑 Supprimer
                </button>
              </div>
            </section>
          ))}
        </div>
      )}

      {/* نافذة إنشاء / تعديل عامل */}
      {form && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm"
          onClick={() => setForm(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-stone-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900">
                {form.id ? `Modifier — ${form.email}` : "Nouvel employé"}
              </h2>
              <button
                type="button"
                onClick={() => setForm(null)}
                aria-label="Fermer"
                className="rounded-lg border border-stone-300 px-2.5 py-1 text-sm text-stone-500 hover:bg-stone-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {!form.id && (
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500">
                    Email (login)
                  </label>
                  <input
                    dir="ltr"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="ex : ahmed@gmail.com"
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-900"
                  />
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Nom affiché
                </label>
                <input
                  value={form.displayName}
                  onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                  placeholder="ex : Ahmed B."
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500">
                  {form.id ? "Nouveau mot de passe (vide = inchangé)" : "Mot de passe"}
                </label>
                <input
                  dir="ltr"
                  type="text"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="6 caractères minimum"
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Permissions — sections accessibles
                </p>
                <div className="space-y-2 rounded-lg border border-stone-200 bg-stone-50 p-3">
                  {PERMS.map((p) => (
                    <label key={p.id} className="flex cursor-pointer items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={Boolean(form.permissions[p.id])}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            permissions: { ...form.permissions, [p.id]: e.target.checked },
                          })
                        }
                        className="mt-0.5 accent-stone-900"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-stone-800">{p.label}</span>
                        <span className="block text-xs text-stone-500">{p.hint}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {formError && <p className="mt-4 text-sm text-rose-600">{formError}</p>}

            <button
              type="button"
              disabled={busy}
              onClick={submitForm}
              className="mt-5 w-full rounded-lg bg-stone-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-stone-700 disabled:opacity-60"
            >
              {busy ? "…" : form.id ? "✓ Enregistrer les modifications" : "✓ Créer le compte"}
            </button>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
}
