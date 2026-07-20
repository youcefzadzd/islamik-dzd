"use client";

/**
 * Floral Romantic RSVP form — soft cream card, rounded boxed inputs,
 * radio-style attendance choices and a full-width deep-burgundy submit.
 *
 * Same submission contract as the other templates (rsvp_responses
 * insert, companions, counts kept in sync) — the system is shared,
 * only the dress is this template's own.
 */

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSupabase } from "@/lib/supabase";

/* elegant "adults only" notice (template chrome) — shown when the
   owner's existing children_allowed setting is OFF */
const ADULTS_ONLY = {
  fr: {
    title: "Soirée réservée aux adultes",
    text: "Pour le confort de tous et le bon déroulement de la réception, nous vous remercions de bien vouloir ne pas venir accompagnés d'enfants. Merci de votre compréhension.",
  },
  ar: {
    title: "نعتذر، الحفل مخصّص للكبار فقط",
    text: "حرصًا على راحتكم وتنظيم الحفل، نرجو منكم التكرم بعدم اصطحاب الأطفال. شكرًا لتفهمكم.",
  },
};

export default function FloralRomanticRsvp({ data, sansClass = "" }) {
  const rsvp = data.rsvp;
  const companionsCfg =
    rsvp.companions || { enabled: false, maxAdults: 0, childrenAllowed: false, maxChildren: 0, t: {} };
  const ct = companionsCfg.t || {};
  const [form, setForm] = useState({ name: "", attending: "yes", message: "" });
  const [companions, setCompanions] = useState([]);
  const companionSeq = useRef(0);
  const [formError, setFormError] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const adultCompanions = companions.filter((c) => c.type === "adult").length;
  const childCompanions = companions.filter((c) => c.type === "child").length;
  const atAdultMax = adultCompanions >= companionsCfg.maxAdults;
  const atChildMax = childCompanions >= companionsCfg.maxChildren;
  const atMax = atAdultMax && (!companionsCfg.childrenAllowed || atChildMax);

  function addCompanion(type) {
    if (type === "adult" ? atAdultMax : atChildMax) return;
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
    const withinLimits = (() => {
      let adults = 0;
      let children = 0;
      return companions.filter((c) =>
        c.type === "child"
          ? companionsCfg.childrenAllowed && ++children <= companionsCfg.maxChildren
          : ++adults <= companionsCfg.maxAdults
      );
    })();
    const list = attending && companionsCfg.enabled ? withinLimits : [];
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
        const { error } = await supabase.from("rsvp_responses").insert({
          wedding_id: rsvp.weddingId,
          guest_name: form.name.trim(),
          attendance_status: form.attending,
          guest_count: totalGuests,
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
        throw new Error("no backend");
      }
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  /* form typography: the clear content font per language (Montserrat for
     FR, Amiri for AR); the script font never appears inside the form */
  const formFont = data.lang === "ar" ? "font-arabicText" : sansClass;
  const labelCls = `mb-2.5 block text-[15px] font-medium leading-[1.4] text-[#43333A] ${formFont}`;
  const boxCls = `w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-[16px] font-normal leading-relaxed text-[#3A2F33] outline-none transition-colors placeholder:text-[15px] placeholder:font-normal placeholder:text-[rgba(58,47,51,0.5)] focus:border-gold ${formFont}`;

  return (
    <div className="mx-auto max-w-md rounded-[28px] border border-gold/20 bg-white/95 px-6 py-10 shadow-[0_18px_50px_rgb(76_27_38_/_0.12)] sm:px-9">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-6 text-center"
          >
            {/* butterfly glyph — this template's signature mark */}
            <span
              aria-hidden
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-burgundy/10 text-burgundy"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 6.5v11" />
                <path d="M12 8.5C10 4.8 5.6 3.6 3.8 5.4c-1.9 1.9-.5 6.4 3 7.4-2.7 1.2-3.3 4.6-1.5 6 1.9 1.5 5.3-.4 6.7-3.8" />
                <path d="M12 8.5c2-3.7 6.4-4.9 8.2-3.1 1.9 1.9.5 6.4-3 7.4 2.7 1.2 3.3 4.6 1.5 6-1.9 1.5-5.3-.4-6.7-3.8" />
                <path d="M12 6.5c-.4-1-1.2-1.8-2-2.2M12 6.5c.4-1 1.2-1.8 2-2.2" />
              </svg>
            </span>
            <p className="font-body text-2xl font-semibold text-ink">{rsvp.confirmationTitle}</p>
            <div className="mt-4 space-y-1">
              {rsvp.confirmationMessage.split("\n").map((line) => (
                <p key={line} className="font-body text-lg leading-relaxed text-ink/80">
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
            className="space-y-6"
          >
            <div>
              <label className={labelCls}>{rsvp.nameLabel} *</label>
              <input
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className={boxCls}
                placeholder={rsvp.namePlaceholder}
              />
            </div>

            <div>
              <label className={labelCls}>{rsvp.attendingLabel} *</label>
              <div className="flex flex-col gap-3 sm:flex-row">
                {["yes", "no"].map((val) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => update("attending", val)}
                    aria-pressed={form.attending === val}
                    className={`fl-btn flex flex-1 items-center gap-2.5 rounded-xl border px-4 py-3 text-start text-[15px] font-medium leading-[1.4] ${formFont} ${
                      form.attending === val
                        ? "border-gold bg-[#FBF3F0] text-[#3A2F33]"
                        : "border-ink/15 text-[#4A3B41] hover:border-gold/50"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        form.attending === val ? "border-gold" : "border-ink/30"
                      }`}
                    >
                      {form.attending === val && <span className="h-2.5 w-2.5 rounded-full bg-gold" />}
                    </span>
                    {val === "yes" ? rsvp.attendingYes : rsvp.attendingNo}
                  </button>
                ))}
              </div>
            </div>

            {form.attending === "yes" && companionsCfg.enabled && (
              <div>
                {/* adults-only notice — driven by the owner's existing
                    children_allowed setting; luxurious, never error-like */}
                {!companionsCfg.childrenAllowed && (
                  <div className="mb-6 rounded-2xl border border-gold/50 bg-[#FBF3F0] px-5 py-7 text-center shadow-[0_8px_28px_rgb(76_27_38_/_0.06)]">
                    <span
                      aria-hidden
                      className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-gold-light/50 text-gold-dark"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="7.4" r="2.5" />
                        <path d="M7.6 18.6c.4-3.4 2-5.4 4.4-5.4s4 2 4.4 5.4" />
                        <path d="M5.4 5.2 18.6 18.8" opacity="0.85" />
                      </svg>
                    </span>
                    <div className="mx-auto mb-3 flex w-24 items-center gap-2 text-gold" aria-hidden>
                      <span className="h-px flex-1 bg-gold/40" />
                      <svg width="16" height="10" viewBox="0 0 32 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M16 17.5C10 12.7 6.5 8.4 6.5 5.2 6.5 2.4 8.7.5 11 .5c1.9 0 3.6 1.1 5 3 1.4-1.9 3.1-3 5-3 2.3 0 4.5 1.9 4.5 4.7 0 3.2-3.5 7.5-9.5 12.3Z" />
                      </svg>
                      <span className="h-px flex-1 bg-gold/40" />
                    </div>
                    <p className={`text-[22px] font-semibold leading-snug text-burgundy ${formFont}`}>
                      {(ADULTS_ONLY[data.lang] || ADULTS_ONLY.fr).title}
                    </p>
                    <p className={`mx-auto mt-3 max-w-xs text-[14.5px] leading-[1.7] text-[rgba(67,51,58,0.75)] ${formFont}`}>
                      {(ADULTS_ONLY[data.lang] || ADULTS_ONLY.fr).text}
                    </p>
                    <div className="mx-auto mt-4 flex w-24 items-center gap-2 text-gold" aria-hidden>
                      <span className="h-px flex-1 bg-gold/40" />
                      <svg width="16" height="10" viewBox="0 0 32 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M16 17.5C10 12.7 6.5 8.4 6.5 5.2 6.5 2.4 8.7.5 11 .5c1.9 0 3.6 1.1 5 3 1.4-1.9 3.1-3 5-3 2.3 0 4.5 1.9 4.5 4.7 0 3.2-3.5 7.5-9.5 12.3Z" />
                      </svg>
                      <span className="h-px flex-1 bg-gold/40" />
                    </div>
                  </div>
                )}
                <label className={labelCls}>{ct.title}</label>

                <AnimatePresence initial={false}>
                  {companions.map((c, i) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="mb-3 rounded-xl border border-ink/15 bg-ivory/60 px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className={`rounded-full bg-gold-light/50 px-3 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wider text-gold-dark ${sansClass}`}
                        >
                          {c.type === "child" ? ct.child : ct.adult}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeCompanion(i)}
                          className={`rounded-full border border-ink/20 px-3 py-0.5 text-[0.62rem] uppercase tracking-wider text-ink/60 transition-colors hover:border-burgundy hover:bg-burgundy hover:text-white ${sansClass}`}
                        >
                          {ct.remove}
                        </button>
                      </div>
                      <input
                        value={c.name}
                        onChange={(e) => updateCompanion(i, e.target.value)}
                        className={`mt-3 ${boxCls}`}
                        placeholder={ct.nameLabel}
                        aria-label={ct.nameLabel}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {atMax ? (
                  <p className={`text-[13px] leading-[1.5] text-[rgba(67,51,58,0.7)] ${formFont}`}>{ct.maxReached}</p>
                ) : (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    {!atAdultMax && (
                      <button
                        type="button"
                        onClick={() => addCompanion("adult")}
                        className={`fl-btn flex-1 rounded-xl border border-dashed border-gold/40 px-4 py-2.5 text-[14px] font-medium leading-[1.4] text-[#8A6660] hover:bg-gold-light/20 ${formFont}`}
                      >
                        {ct.addAdult}
                      </button>
                    )}
                    {companionsCfg.childrenAllowed && !atChildMax && (
                      <button
                        type="button"
                        onClick={() => addCompanion("child")}
                        className={`fl-btn flex-1 rounded-xl border border-dashed border-gold/40 px-4 py-2.5 text-[14px] font-medium leading-[1.4] text-[#8A6660] hover:bg-gold-light/20 ${formFont}`}
                      >
                        {ct.addChild}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className={labelCls}>{rsvp.messageLabel}</label>
              <textarea
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                rows={4}
                className={`${boxCls} resize-none leading-[1.6]`}
                placeholder={rsvp.messagePlaceholder}
              />
            </div>

            <div className="pt-1">
              <motion.button
                type="submit"
                disabled={status === "submitting"}
                whileTap={{ scale: 0.98 }}
                className={`flex w-full items-center justify-center gap-2.5 rounded-xl bg-burgundy px-8 py-4 text-[17px] font-semibold tracking-[0.02em] text-white shadow-[0_10px_28px_rgb(76_27_38_/_0.3)] transition-all duration-300 hover:bg-burgundy-dark hover:shadow-[0_12px_32px_rgb(76_27_38_/_0.38)] disabled:opacity-70 ${formFont}`}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                  <path d="M21 3 10 14M21 3l-7 18-3-8-8-3 18-7Z" />
                </svg>
                {status === "submitting" ? rsvp.submittingText : rsvp.sealButtonText}
              </motion.button>
              {/* لا تلميح «المسوا الختم» — زر الإرسال هنا حبة عنابية
                  صريحة وليس ختم شمع؛ النص كان موروثًا من Islamic Royal */}
            </div>

            {formError && <p className="text-center text-sm text-[#A6452E]">{formError}</p>}
            {status === "error" && (
              <p className="text-center text-sm text-[#A6452E]">{rsvp.errorMessage}</p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
