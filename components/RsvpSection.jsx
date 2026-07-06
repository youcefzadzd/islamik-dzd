"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "./Reveal";
import SectionPanel from "./SectionPanel";
import { getSupabase } from "@/lib/supabase";

export default function RsvpSection({ data }) {
  const rsvp = data.rsvp;
  const companionsCfg = rsvp.companions || { enabled: false, max: 0, childrenAllowed: false, t: {} };
  const ct = companionsCfg.t || {};
  const [form, setForm] = useState({ name: "", attending: "yes", message: "" });
  const [companions, setCompanions] = useState([]); // [{ id, name, type: "adult" | "child" }]
  const companionSeq = useRef(0);
  const [formError, setFormError] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const atMax = companions.length >= companionsCfg.max;

  function addCompanion(type) {
    if (atMax) return;
    setFormError("");
    setCompanions((list) => [...list, { id: ++companionSeq.current, name: "", type }]);
  }

  function updateCompanion(index, name) {
    setFormError("");
    setCompanions((list) => list.map((c, i) => (i === index ? { ...c, name } : c)));
  }

  function removeCompanion(index) {
    setFormError("");
    setCompanions((list) => list.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || status === "submitting") return;

    const attending = form.attending === "yes";
    const list = attending && companionsCfg.enabled ? companions.slice(0, companionsCfg.max) : [];
    if (list.some((c) => !c.name.trim())) {
      setFormError(ct.missingName || "");
      return;
    }
    setFormError("");

    const cleaned = list.map((c) => ({
      name: c.name.trim(),
      type: c.type === "child" ? "child" : "adult",
    }));
    const adultCount = attending ? 1 + cleaned.filter((c) => c.type === "adult").length : 0;
    const childCount = attending ? cleaned.filter((c) => c.type === "child").length : 0;
    const totalGuests = adultCount + childCount;

    setStatus("submitting");
    try {
      const supabase = getSupabase();
      if (supabase) {
        // primary store: Supabase (RLS allows guests to insert only)
        const { error } = await supabase.from("rsvp_responses").insert({
          wedding_id: rsvp.weddingId,
          guest_name: form.name.trim(),
          attendance_status: form.attending,
          guest_count: totalGuests, // kept in sync for backward compatibility
          adult_count: adultCount,
          child_count: childCount,
          total_guests: totalGuests,
          companions: attending ? cleaned : [],
          message: form.message.trim(),
          language: data.lang,
        });
        if (error) throw error;
      } else if (rsvp.submitEndpoint) {
        const res = await fetch(rsvp.submitEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            ...form,
            adult_count: adultCount,
            child_count: childCount,
            total_guests: totalGuests,
            companions: attending ? cleaned : [],
          }),
        });
        if (!res.ok) throw new Error("submit failed");
      } else {
        // no storage backend configured
        throw new Error("no backend");
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

                {form.attending === "yes" && companionsCfg.enabled && (
                  <div>
                    <label className="mb-3 block text-xs uppercase tracking-widest text-gold-dark">
                      {ct.title}
                    </label>

                    <AnimatePresence initial={false}>
                      {companions.map((c, i) => (
                        <motion.div
                          key={c.id}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="mb-3 rounded-xl border border-gold/40 bg-white/40 px-4 py-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="rounded-full border border-gold/50 px-3 py-0.5 text-xs uppercase tracking-wider text-gold-dark">
                              {c.type === "child" ? ct.child : ct.adult}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeCompanion(i)}
                              className="rounded-full border border-burgundy/40 px-3 py-0.5 text-xs uppercase tracking-wider text-burgundy transition-colors hover:bg-burgundy hover:text-ivory-light"
                            >
                              {ct.remove}
                            </button>
                          </div>
                          <input
                            value={c.name}
                            onChange={(e) => updateCompanion(i, e.target.value)}
                            className="mt-2 w-full border-b border-gold/40 bg-transparent py-2 font-body text-lg outline-none focus:border-burgundy"
                            placeholder={ct.nameLabel}
                            aria-label={ct.nameLabel}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {atMax ? (
                      <p className="font-body text-sm italic text-ink/60">{ct.maxReached}</p>
                    ) : (
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => addCompanion("adult")}
                          className="flex-1 rounded-full border border-gold/50 px-4 py-2.5 font-body text-sm text-gold-dark transition-colors hover:bg-ivory-dark"
                        >
                          {ct.addAdult}
                        </button>
                        {companionsCfg.childrenAllowed && (
                          <button
                            type="button"
                            onClick={() => addCompanion("child")}
                            className="flex-1 rounded-full border border-gold/50 px-4 py-2.5 font-body text-sm text-gold-dark transition-colors hover:bg-ivory-dark"
                          >
                            {ct.addChild}
                          </button>
                        )}
                      </div>
                    )}
                    {!companionsCfg.childrenAllowed && (
                      <p className="mt-2 font-body text-sm italic text-ink/60">{ct.noChildrenNote}</p>
                    )}
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

                {formError && <p className="text-center text-sm text-burgundy">{formError}</p>}
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
