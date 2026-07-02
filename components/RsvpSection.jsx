"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "./Reveal";

export default function RsvpSection({ data }) {
  const rsvp = data.rsvp;
  const [form, setForm] = useState({ name: "", attending: "yes", guests: "1", message: "" });
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setStatus("submitting");
    try {
      if (rsvp.submitEndpoint) {
        await fetch(rsvp.submitEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        const stored = JSON.parse(localStorage.getItem("rsvps") || "[]");
        stored.push({ ...form, submittedAt: new Date().toISOString() });
        localStorage.setItem("rsvps", JSON.stringify(stored));
      }
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="px-6 py-20 bg-ivory">
      <div className="invite-card">
        <Reveal>
          <div className="text-center mb-8">
            <p className="uppercase tracking-[0.3em] text-xs text-gold-dark mb-2">
              {rsvp.deadline}
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-emerald mb-3">{rsvp.heading}</h2>
            <div className="divider" />
            <p className="mt-4 font-body text-ink/80">{rsvp.subheading}</p>
          </div>

          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <p className="font-serif text-2xl text-emerald mb-2">✦</p>
                <p className="font-body text-lg text-ink/90">{rsvp.confirmationMessage}</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gold-dark mb-2">
                    {rsvp.nameLabel}
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="w-full bg-transparent border-b border-ink/30 focus:border-emerald outline-none py-2 font-body text-lg"
                    placeholder={rsvp.namePlaceholder}
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-gold-dark mb-2">
                    {rsvp.attendingLabel}
                  </label>
                  <div className="flex gap-3">
                    {["yes", "no"].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => update("attending", val)}
                        className={`flex-1 py-2 rounded-full border text-sm uppercase tracking-wide transition-colors ${
                          form.attending === val
                            ? "bg-emerald text-ivory border-emerald"
                            : "border-ink/20 text-ink/70"
                        }`}
                      >
                        {val === "yes" ? rsvp.attendingYes : rsvp.attendingNo}
                      </button>
                    ))}
                  </div>
                </div>

                {form.attending === "yes" && (
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gold-dark mb-2">
                      {rsvp.guestsLabel}
                    </label>
                    <select
                      value={form.guests}
                      onChange={(e) => update("guests", e.target.value)}
                      className="w-full bg-transparent border-b border-ink/30 focus:border-emerald outline-none py-2 font-body text-lg"
                    >
                      {[1, 2, 3, 4].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs uppercase tracking-widest text-gold-dark mb-2">
                    {rsvp.messageLabel}
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    rows={3}
                    className="w-full bg-transparent border-b border-ink/30 focus:border-emerald outline-none py-2 font-body text-lg resize-none"
                    placeholder={rsvp.messagePlaceholder}
                  />
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full py-3 rounded-full bg-emerald text-ivory uppercase tracking-[0.2em] text-sm shadow-card hover:bg-emerald-dark transition-colors disabled:opacity-60"
                >
                  {status === "submitting" ? rsvp.submittingText : rsvp.submitText}
                </motion.button>

                {status === "error" && (
                  <p className="text-center text-sm text-emerald">
                    Une erreur est survenue. Veuillez réessayer.
                  </p>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </Reveal>
      </div>
    </section>
  );
}
