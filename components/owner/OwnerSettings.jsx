"use client";

import { useEffect, useState } from "react";
import { OwnerGate, OwnerLayout, ownerHeaders, OWNER_PASS_KEY } from "./shared";

/**
 * Platform settings. The environment section is live; the rest is
 * scaffolding for future configuration (branding, default template,
 * notifications) — visible but clearly marked as coming soon.
 */
export default function OwnerSettings() {
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(OWNER_PASS_KEY)) {
      fetch("/api/owner/weddings", { headers: ownerHeaders() }).then((r) => setGranted(r.ok));
    }
  }, []);

  if (!granted) return <OwnerGate onGranted={() => setGranted(true)} />;

  const supabaseHost = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace("https://", "") || "non configuré";

  return (
    <OwnerLayout active="/owner/settings" title="Paramètres">
      <div className="space-y-4">
        <section className="rounded-2xl border border-gold/30 bg-ivory-light p-5">
          <h2 className="mb-3 font-semibold text-ink">Environnement</h2>
          <dl className="space-y-2 text-sm">
            {[
              ["Base de données", supabaseHost],
              ["Modèle par défaut", "wedding-config.json"],
              ["Mot de passe propriétaire", "défini via OWNER_PASSWORD (variables d'environnement)"],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-wrap gap-2">
                <dt className="w-48 shrink-0 text-ink/55">{k}</dt>
                <dd className="text-ink/85">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        {[
          ["Identité de la plateforme", "Nom, logo et couleurs de votre marque sur les pages owner."],
          ["Modèle d'invitation par défaut", "Textes et médias proposés lors de la création d'un mariage."],
          ["Notifications", "Recevoir un email à chaque nouvelle réponse RSVP."],
        ].map(([title, desc]) => (
          <section key={title} className="rounded-2xl border border-dashed border-gold/40 bg-ivory-light/50 p-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="font-semibold text-ink/70">{title}</h2>
                <p className="mt-1 text-sm text-ink/50">{desc}</p>
              </div>
              <span className="shrink-0 rounded-full bg-gold/15 px-3 py-1 text-xs uppercase tracking-wider text-gold-dark">
                bientôt
              </span>
            </div>
          </section>
        ))}
      </div>
    </OwnerLayout>
  );
}
