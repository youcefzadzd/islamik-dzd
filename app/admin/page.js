"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

/**
 * Private RSVP dashboard. Access is protected by Supabase Auth, and Row
 * Level Security guarantees each admin only ever receives the responses
 * of their own wedding_id — even if this client code were tampered with.
 */
export default function AdminPage() {
  const supabase = getSupabase();
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  const loadRows = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("rsvp_responses")
      .select("*")
      .order("created_at", { ascending: false });
    setRows(error ? [] : data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (session) loadRows();
  }, [session, loadRows]);

  async function signIn(e) {
    e.preventDefault();
    setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError("Identifiants incorrects.");
  }

  async function removeRow(id) {
    if (!window.confirm("Supprimer cette réponse ?")) return;
    await supabase.from("rsvp_responses").delete().eq("id", id);
    loadRows();
  }

  if (!supabase) {
    return (
      <Shell>
        <p className="font-body text-lg text-ink/80">
          Supabase n'est pas configuré. Copiez <code>.env.local.example</code> vers{" "}
          <code>.env.local</code> et renseignez vos clés.
        </p>
      </Shell>
    );
  }

  if (!session) {
    return (
      <Shell>
        <h1 className="font-monogram text-4xl text-gold-dark">Espace des mariés</h1>
        <form onSubmit={signIn} className="mx-auto mt-8 max-w-xs space-y-5 text-left">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-widest text-gold-dark">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-gold/40 bg-transparent py-2 font-body text-lg outline-none focus:border-burgundy"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-widest text-gold-dark">
              Mot de passe
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-gold/40 bg-transparent py-2 font-body text-lg outline-none focus:border-burgundy"
            />
          </div>
          {authError && <p className="text-sm text-burgundy">{authError}</p>}
          <button
            type="submit"
            className="w-full rounded-full bg-burgundy px-6 py-3 text-sm uppercase tracking-[0.18em] text-ivory-light shadow-card transition-colors hover:bg-burgundy-dark"
          >
            Se connecter
          </button>
        </form>
      </Shell>
    );
  }

  const attending = (rows || []).filter((r) => r.attendance_status === "yes");
  const totalGuests = attending.reduce((sum, r) => sum + (r.guest_count || 0), 0);

  return (
    <Shell wide>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-monogram text-4xl text-gold-dark">Réponses des invités</h1>
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="rounded-full border border-gold/50 px-4 py-1.5 text-sm text-gold-dark transition-colors hover:bg-ivory-dark"
        >
          Se déconnecter
        </button>
      </div>

      {/* totals */}
      <div className="mt-8 grid grid-cols-3 gap-3 text-center">
        {[
          ["Réponses", (rows || []).length],
          ["Présents", attending.length],
          ["Invités au total", totalGuests],
        ].map(([label, value]) => (
          <div key={label} className="lux-card px-2 py-5">
            <p className="relative font-serif text-3xl text-burgundy">{value}</p>
            <p className="relative mt-1 text-xs uppercase tracking-[0.18em] text-gold-dark">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* responses */}
      <div className="mt-8 space-y-3">
        {loading && <p className="text-center font-body text-ink/60">Chargement…</p>}
        {rows && rows.length === 0 && !loading && (
          <p className="text-center font-body text-lg text-ink/60">
            Aucune réponse pour le moment.
          </p>
        )}
        {(rows || []).map((r) => (
          <div key={r.id} className="lux-card px-5 py-4">
            <div className="relative flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-serif text-lg text-ink">
                  {r.guest_name}{" "}
                  <span className={r.attendance_status === "yes" ? "text-burgundy" : "text-ink/50"}>
                    {r.attendance_status === "yes"
                      ? `✓ présent · ${r.guest_count} pers.`
                      : "✗ absent"}
                  </span>
                </p>
                {r.message && <p className="mt-1 font-body italic text-ink/75">« {r.message} »</p>}
                <p className="mt-1 text-xs text-ink/45">
                  {new Date(r.created_at).toLocaleString("fr-FR")} · {r.language} · {r.wedding_id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeRow(r.id)}
                className="rounded-full border border-burgundy/40 px-3 py-1 text-xs uppercase tracking-wider text-burgundy transition-colors hover:bg-burgundy hover:text-ivory-light"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </Shell>
  );
}

function Shell({ children, wide = false }) {
  return (
    <main className="page-paper min-h-screen px-4 py-10">
      <div
        className={`lux-panel mx-auto w-full px-6 py-10 text-center sm:px-9 ${
          wide ? "max-w-3xl" : "max-w-md"
        }`}
      >
        <div className="relative">{children}</div>
      </div>
    </main>
  );
}
