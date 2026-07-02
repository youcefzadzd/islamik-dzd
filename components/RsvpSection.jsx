"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "./Reveal";
import SectionPanel from "./SectionPanel";

export default function RsvpSection({ data }) {
  const rsvp = data.rsvp;
  const [form, setForm] = useState({ name: "", attending: "yes", guests: "1", message: "" });
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || status === "submitting") return;
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
    <SectionPanel>
      <div className="relative">
        <Reveal>
          <div className="mb-8 text-center">
            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-gold-dark">{rsvp.deadline}</p>
            <h2 className="font-monogram text-4xl text-gold-dark sm:text-5xl">{rsvp.heading}</h2>
            <div className="divider mt-4">
              <span className="text-gold">✦</span>
            </div>
            <p className="mt-4 font-body text-lg text-ink/80">{rsvp.subheading}</p>
          </div>

          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center"
              >
                <img
                  src={data.assets.waxSeal}
                  alt=""
                  className="mx-auto mb-4 w-20 select-none"
                  draggable={false}
                />
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
                  <label className="mb-2 block text-xs uppercase tracking-widest text-gold-dark">
                    {rsvp.nameLabel}
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="w-full border-b border-gold/40 bg-transparent py-2 font-body text-lg outline-none focus:border-burgundy"
                    placeholder={rsvp.namePlaceholder}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs uppercase tracking-widest text-gold-dark">
                    {rsvp.attendingLabel}
                  </label>
                  <div className="flex gap-3">
                    {["yes", "no"].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => update("attending", val)}
                        className={`flex-1 rounded-full border py-2 text-sm uppercase tracking-wide transition-colors ${
                          form.attending === val
                            ? "border-burgundy bg-burgundy text-ivory-light"
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
                    <label className="mb-2 block text-xs uppercase tracking-widest text-gold-dark">
                      {rsvp.guestsLabel}
                    </label>
                    <select
                      value={form.guests}
                      onChange={(e) => update("guests", e.target.value)}
                      className="w-full border-b border-gold/40 bg-transparent py-2 font-body text-lg outline-none focus:border-burgundy"
                    >
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-xs uppercase tracking-widest text-gold-dark">
                    {rsvp.messageLabel}
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    rows={3}
                    className="w-full resize-none border-b border-gold/40 bg-transparent py-2 font-body text-lg outline-none focus:border-burgundy"
                    placeholder={rsvp.messagePlaceholder}
                  />
                </div>

                {/* burgundy wax-seal submit button */}
                <div className="flex flex-col items-center pt-4">
                  <motion.button
                    type="submit"
                    disabled={status === "submitting"}
                    whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
                    whileTap={{ scale: 0.9 }}
                    className="relative w-36 outline-none disabled:opacity-70"
                    aria-label={rsvp.sealButtonText}
                  >
                    <img src={data.assets.waxSeal} alt="" className="w-full select-none" draggable={false} />
                    <span
                      className="absolute inset-0 flex items-center justify-center pb-[6%] font-monogram text-3xl text-gold-light"
                      style={{
                        textShadow:
                          "0 1px 1px rgb(var(--color-burgundy-dark)), 0 -1px 1px rgb(var(--color-burgundy-light) / 0.6)",
                      }}
                    >
                      {status === "submitting" ? "…" : rsvp.sealButtonText}
                    </span>
                  </motion.button>
                  <p className="mt-3 font-body text-sm italic text-ink/60">{rsvp.sealButtonHint}</p>
                </div>

                {status === "error" && (
                  <p className="text-center text-sm text-burgundy">
                    Une erreur est survenue. Veuillez réessayer.
                  </p>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </Reveal>
      </div>
    </SectionPanel>
  );
}
