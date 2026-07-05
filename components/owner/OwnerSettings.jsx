"use client";

import { useEffect, useState } from "react";
import { OwnerGate, OwnerLayout, ownerHeaders, glass, OWNER_PASS_KEY } from "./shared";

/**
 * Platform settings. Environment + links are live; company branding is
 * stored locally (browser) until a settings table is worth adding.
 */
export default function OwnerSettings() {
  const [granted, setGranted] = useState(false);
  const [company, setCompany] = useState("");

  useEffect(() => {
    setCompany(localStorage.getItem("platform-company") || "Invitations Royales");
    if (sessionStorage.getItem(OWNER_PASS_KEY)) {
      fetch("/api/owner/weddings", { headers: ownerHeaders() }).then((r) => setGranted(r.ok));
    }
  }, []);

  if (!granted) return <OwnerGate onGranted={() => setGranted(true)} />;

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
            className="w-full rounded-lg border border-gold/40 bg-white px-3 py-2 text-sm outline-none focus:border-burgundy"
          />
          <p className="mt-1 text-xs text-ink/45">
            Enregistré dans ce navigateur. Logo et domaine personnalisé : bientôt.
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
