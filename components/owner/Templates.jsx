"use client";

import { useEffect, useState } from "react";
import {
  AccessDenied,
  OwnerGate,
  OwnerLayout,
  ownerHeaders,
  glass,
  getSession,
  hasStoredCredentials,
} from "./shared";
import { TEMPLATES } from "@/lib/templates";

export default function Templates() {
  const [granted, setGranted] = useState(false);
  const [denied, setDenied] = useState(false);
  const [useCount, setUseCount] = useState(null);

  async function load() {
    /* صلاحية القسم من الجلسة — عدد الأعراس يحتاج صلاحية weddings،
       فإن غابت نعرض الصفحة بدون العدّاد فقط */
    const session = getSession();
    if (session?.role === "staff" && !session.permissions?.templates) {
      setGranted(true);
      return setDenied(true);
    }
    setGranted(true);
    const r = await fetch("/api/owner/weddings", { headers: ownerHeaders() });
    if (r.status === 401) return setGranted(false);
    if (r.ok) setUseCount((await r.json()).rows.length);
  }

  useEffect(() => {
    if (hasStoredCredentials()) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!granted) return <OwnerGate onGranted={() => load()} />;
  if (denied) return <AccessDenied />;

  return (
    <OwnerLayout active="/owner/templates" title="Modèles">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((t) =>
          t.status === "live" ? (
            <div key={t.id} className={`overflow-hidden ${glass}`}>
              <img src={t.preview} alt={t.name} className="aspect-[4/3] w-full object-cover" />
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-ink">{t.name}</h2>
                  <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[0.62rem] uppercase tracking-wider text-gold-dark">
                    v{t.version}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink/60">{t.description}</p>
                <p className="mt-2 text-xs text-ink/45">
                  Utilisé par {useCount ?? "…"} mariage(s)
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {t.demoUrl && (
                    <a
                      href={t.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-gold/50 px-3 py-1.5 text-sm text-gold-dark hover:bg-ivory-dark"
                    >
                      Prévisualiser
                    </a>
                  )}
                  <a
                    href="/owner/weddings/new"
                    className="rounded-lg bg-stone-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-stone-700"
                  >
                    Utiliser
                  </a>
                  <span
                    title="L'édition du modèle se fait dans le code (wedding-config.json + composants)"
                    className="cursor-not-allowed rounded-lg border border-gold/30 px-3 py-1.5 text-sm text-ink/35"
                  >
                    Éditer
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div key={t.id} className={`flex flex-col items-center justify-center gap-2 border-dashed p-8 text-center ${glass}`}>
              <span className="text-3xl">🖼</span>
              <p className="font-semibold text-ink/60">{t.name}</p>
              <span className="rounded-full bg-gold/15 px-3 py-1 text-xs uppercase tracking-wider text-gold-dark">
                bientôt
              </span>
            </div>
          )
        )}
      </div>
    </OwnerLayout>
  );
}
