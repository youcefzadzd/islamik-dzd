"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "./Reveal";
import SectionPanel from "./SectionPanel";
import { getSupabase } from "@/lib/supabase";

export default function RsvpSection({ data }) {
  const rsvp = data.rsvp;
  const [form, setForm] = useState({ name: "", attending: "yes", guests: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || status === "submitting") return;
    setStatus("submitting");
    try {
      const supabase = getSupabase();
      if (supabase) {
        // primary store: Supabase (RLS allows guests to insert only)
        const { error } = await supabase.from("rsvp_responses").insert({
          wedding_id: rsvp.weddingId,
          guest_name: form.name.trim(),
          attendance_status: form.attending,
          guest_count: form.attending === "yes" ? Number(form.guests) || 1 : 0,
          message: form.message.trim(),
          language: data.lang,
        });
        if (error) throw error;
      } else if (rsvp.submitEndpoint) {
        const res = await fetch(rsvp.submitEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("submit failed");
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
          <div className="mb-10 text-center">
            <h2 className="font-monogram text-4xl text-gold-dark sm:text-5xl">{rsvp.heading}</h2>
            <p className="mt-3 font-body text-lg leading-relaxed text-ink/80">{rsvp.subheading}</p>
            <div className="divider mt-5">
              <span className="text-gold">✦</span>
            </div>
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
                  className="mx-auto mb-5 w-20 select-none"
                  draggable={false}
                />
                <p className="font-monogram text-4xl text-gold-dark">{rsvp.confirmationTitle}</p>
                <div className="mt-4 space-y-1">
                  {rsvp.confirmationMessage.split("\n").map((line) => (
                    <p key={line} className="font-body text-lg leading-relaxed text-ink/90">
                      {line}
                    </p>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-7"
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
                  <div className="flex flex-col gap-3 sm:flex-row">
                    {["yes", "no"].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => update("attending", val)}
                        className={`flex-1 rounded-full border px-4 py-3 font-body text-base transition-colors ${
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
                      required
                      value={form.guests}
                      onChange={(e) => update("guests", e.target.value)}
                      className={`w-full border-b border-gold/40 bg-transparent py-2 font-body text-lg outline-none focus:border-burgundy ${
                        form.guests === "" ? "text-ink/50" : ""
                      }`}
                    >
                      <option value="" disabled>
                        {rsvp.guestsPlaceholder}
                      </option>
                      {rsvp.guestsOptions.map((label, n) => (
                        <option key={label} value={n + 1}>
                          {label}
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
                  <p className="text-center text-sm text-burgundy">{rsvp.errorMessage}</p>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </Reveal>
      </div>
    </SectionPanel>
  );
}
