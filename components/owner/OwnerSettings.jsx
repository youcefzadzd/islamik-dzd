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

/**
 * Platform settings. Environment + links are live; company branding is
 * stored locally (browser) until a settings table is worth adding.
 */
export default function OwnerSettings() {
  const [granted, setGranted] = useState(false);
  const [company, setCompany] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [waState, setWaState] = useState("idle"); // idle | saving | saved | error
  const [waError, setWaError] = useState("");

  const [denied, setDenied] = useState(false);

  /* الفحص والتحميل عبر site-settings نفسها — صلاحية «settings» */
  async function loadSettings() {
    const res = await fetch("/api/owner/site-settings", { headers: ownerHeaders() });
    if (res.status === 401) return setGranted(false);
    setGranted(true);
    if (res.status === 403) return setDenied(true);
    if (res.ok) {
      const j = await res.json();
      setWhatsapp(j.whatsappNumber || "");
    }
  }

  useEffect(() => {
    setCompany(localStorage.getItem("platform-company") || "Invitations Royales");
    if (hasStoredCredentials()) loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveWhatsapp() {
    setWaState("saving");
    setWaError("");
    const res = await fetch("/api/owner/site-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...ownerHeaders() },
      body: JSON.stringify({ whatsappNumber: whatsapp }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      setWaState("error");
      setWaError(
        j.error === "invalid number"
          ? "Numéro invalide — format international sans +, ex : 213550123456."
          : j.error || "Erreur serveur."
      );
      return;
    }
    setWhatsapp(j.whatsappNumber || "");
    setWaState("saved");
    setTimeout(() => setWaState("idle"), 2000);
  }

  if (!granted) return <OwnerGate onGranted={() => loadSettings()} />;
  if (denied) return <AccessDenied />;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseRef = supabaseUrl.replace("https://", "").split(".")[0];

  return (
    <OwnerLayout active="/owner/settings" title="Paramètres">
      <div className="grid gap-4 lg:grid-cols-2">
        <section className={`p-5 ${glass}`}>
          <h2 className="mb-3 font-semibold text-ink">Identité</h2>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-ink/60">
            Nom de la société
          </label>
          <input
            value={company}
            onChange={(e) => {
              setCompany(e.target.value);
              localStorage.setItem("platform-company", e.target.value);
            }}
            className="w-full rounded-lg border border-gold/40 bg-white px-3 py-2 text-sm outline-none focus:border-stone-900"
          />
          <p className="mt-1 text-xs text-ink/45">
            Enregistré dans ce navigateur. Logo et domaine personnalisé : bientôt.
          </p>
        </section>

        <section className={`p-5 ${glass}`}>
          <h2 className="mb-3 font-semibold text-ink">Site vitrine — WhatsApp</h2>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-ink/60">
            Numéro WhatsApp du site
          </label>
          <div className="flex gap-2">
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="213550123456"
              dir="ltr"
              inputMode="tel"
              className="w-full rounded-lg border border-gold/40 bg-white px-3 py-2 text-sm tabular-nums outline-none focus:border-stone-900"
            />
            <button
              type="button"
              disabled={waState === "saving"}
              onClick={saveWhatsapp}
              className="shrink-0 rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-stone-700 disabled:opacity-60"
            >
              {waState === "saving" ? "…" : waState === "saved" ? "✓ Enregistré" : "Enregistrer"}
            </button>
          </div>
          {waState === "error" && <p className="mt-2 text-xs text-rose-600">{waError}</p>}
          <p className="mt-2 text-xs text-ink/45">
            Format international sans « + » (ex : 213550123456). Utilisé par tous les boutons
            WhatsApp du site vitrine (/site) — vide : les boutons renvoient vers la section
            contact. Prise en compte en ~1 minute.
          </p>
        </section>

        <section className={`p-5 ${glass}`}>
          <h2 className="mb-3 font-semibold text-ink">Sécurité</h2>
          <p className="text-sm text-ink/75">
            Le mot de passe propriétaire est défini par la variable
            d'environnement <code>OWNER_PASSWORD</code> (local :{" "}
            <code>.env.local</code> · production : Vercel → Settings →
            Environment Variables). Changez-le là, puis redéployez.
          </p>
          <p className="mt-2 text-sm text-ink/75">
            Les mots de passe clients sont hachés (scrypt) — réinitialisables
            depuis « Modifier » sur chaque mariage.
          </p>
        </section>

        <section className={`p-5 ${glass}`}>
          <h2 className="mb-3 font-semibold text-ink">Supabase</h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-ink/55">Projet</dt>
              <dd className="text-ink/85">{supabaseRef || "non configuré"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-ink/55">Tables</dt>
              <dd className="text-ink/85">weddings · rsvp_responses · Storage “media”</dd>
            </div>
          </dl>
          <a
            href={`https://supabase.com/dashboard/project/${supabaseRef}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block rounded-lg border border-gold/50 px-3 py-1.5 text-sm text-gold-dark hover:bg-ivory-dark"
          >
            Ouvrir Supabase ↗
          </a>
        </section>

        <section className={`p-5 ${glass}`}>
          <h2 className="mb-3 font-semibold text-ink">Hébergement (Vercel)</h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-ink/55">Projet</dt>
              <dd className="text-ink/85">islamic-royal-invitation</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-ink/55">Domaine</dt>
              <dd className="text-ink/85">
                islamic-royal-invitation.vercel.app{" "}
                <span className="text-ink/45">(domaine personnalisé : Vercel → Domains)</span>
              </dd>
            </div>
          </dl>
          <a
            href="https://vercel.com/youcefdzd/islamic-royal-invitation"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block rounded-lg border border-gold/50 px-3 py-1.5 text-sm text-gold-dark hover:bg-ivory-dark"
          >
            Ouvrir Vercel ↗
          </a>
        </section>
      </div>
    </OwnerLayout>
  );
}
