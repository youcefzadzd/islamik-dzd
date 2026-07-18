"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import WaxSeal from "./WaxSeal";

/**
 * Full-screen ornate envelope (AI-generated artwork: gold arabesque
 * flaps on ivory paper — /assets/envelope-ornate.webp), opened like a
 * real envelope:
 *  press → the seal compresses under the tap
 *  fold  → the TOP flap folds up slowly (2s) around the screen's top
 *          edge, the seal riding on its tip
 *  done  → the invitation appears directly beneath (~2.9s total)
 *
 * The artwork's four flap creases run at 45° and meet at its centre
 * node (49.3% height). The four screen pieces are the same image
 * (object-cover, centred) clipped into 45° wedges anchored to that
 * node — vmax offsets keep the cut lines exactly on the printed
 * creases at every viewport ratio.
 */
const EASE = [0.22, 1, 0.36, 1];
// dev-only: slow the whole sequence down to inspect it (keep 1 in production)
const SLOW = 1;

/* the crease node of the artwork, in viewport terms (image is square,
   object-cover centred → its centre sits at 50vw/50vh; the node is
   0.7% of the image side above centre) */
const NODE_Y = "calc(50% - 0.7vmax)";
const K = "300vmax"; // generous wedge reach — clipped by the viewport anyway

const WEDGES = {
  top: `polygon(calc(50% - ${K}) calc(50% - 0.7vmax - ${K}), calc(50% + ${K}) calc(50% - 0.7vmax - ${K}), 50% ${NODE_Y})`,
  bottom: `polygon(calc(50% - ${K}) calc(50% - 0.7vmax + ${K}), calc(50% + ${K}) calc(50% - 0.7vmax + ${K}), 50% ${NODE_Y})`,
  left: `polygon(calc(50% - ${K}) calc(50% - 0.7vmax - ${K}), 50% ${NODE_Y}, calc(50% - ${K}) calc(50% - 0.7vmax + ${K}))`,
  right: `polygon(calc(50% + ${K}) calc(50% - 0.7vmax - ${K}), 50% ${NODE_Y}, calc(50% + ${K}) calc(50% - 0.7vmax + ${K}))`,
};

const pieceBase = {
  backgroundImage: "url(/assets/envelope-ornate.webp)",
  backgroundSize: "cover",
  backgroundPosition: "center",
};

export default function EnvelopeIntro({ data, onMountMain, onDone }) {
  const [stage, setStage] = useState("closed");
  const [lang, setLang] = useState("fr");

  useEffect(() => {
    setLang(document.documentElement.lang === "ar" ? "ar" : "fr");
  }, []);

  const initials = `${data.couple.groomName.trim().charAt(0)} & ${data.couple.brideName
    .trim()
    .charAt(0)}`;

  const opening = stage !== "closed";

  function open() {
    if (stage !== "closed") return;
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(12);
    setStage("press");
    // الغطاء يصعد ببطء (ثانيتان) والختم راكب عليه — ثم الصفحة مباشرة
    setTimeout(onMountMain, 1200 * SLOW);
    setTimeout(onDone, 2400 * SLOW);
  }

  const sealState = stage === "closed" ? "idle" : "press";

  const flapShadow = "drop-shadow(0 5px 14px rgb(var(--color-ink) / 0.16))";

  return (
    <motion.div
      exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeOut" } }}
      className="fixed inset-0 z-50 overflow-hidden bg-ivory"
      style={{ perspective: 1200 }}
    >
      {/* الجناحان المزخرفان + الجيب السفلي — ثابتة */}
      {["bottom", "left", "right"].map((id) => (
        <div key={id} className="absolute inset-0" style={{ filter: flapShadow }}>
          <div className="absolute inset-0" style={{ ...pieceBase, clipPath: WEDGES[id] }} />
        </div>
      ))}

      {/* الغطاء العلوي — ينطوي للأعلى ببطء حول حافة الشاشة، والختم راكب
          على طرفه يصعد معه (الختم خارج قصاصة الورق فلا يُقتطع) */}
      <motion.div
        animate={
          opening
            ? {
                rotateX: 150,
                transition: { delay: 0.25 * SLOW, duration: 2.0 * SLOW, ease: "easeInOut" },
              }
            : { rotateX: 0 }
        }
        className="absolute inset-0 z-10"
        style={{
          transformOrigin: "50% 0%",
          transformStyle: "preserve-3d",
          filter: flapShadow,
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ ...pieceBase, clipPath: WEDGES.top }}
        />

        {/* الختم الذهبي على طرف الغطاء — بلا هالة ولا ظل */}
        <div
          className="absolute z-30 w-[min(30vmin,170px)]"
          style={{ left: "50%", top: NODE_Y, transform: "translate(-50%, -50%)" }}
        >
          <WaxSeal
            src={data.assets.envelopeSeal}
            initials={initials}
            state={sealState}
            onOpen={open}
            fontSize="clamp(1.3rem, 5vmin, 2rem)"
            flat
            noShadow
          />
        </div>
      </motion.div>

      {/* نص الفتح + الزخرفة — HTML حقيقي (مترجم) يتلاشى عند النقر */}
      <motion.div
        animate={{ opacity: opening ? 0 : 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 text-center"
        style={{ top: `calc(50% - 0.7vmax + max(19vmin, 128px))` }}
      >
        <p
          className={`text-ink/60 ${lang === "ar" ? "font-arabicText" : "font-serif"}`}
          style={{ fontSize: "clamp(1.3rem, 4.6vmin, 2rem)", letterSpacing: "0.04em" }}
        >
          {lang === "ar" ? "اضغط لفتح الدعوة" : "Appuyez pour ouvrir"}
        </p>
        <div
          className="mx-auto mt-4 flex items-center gap-3 text-gold-dark/70"
          style={{ width: "min(46vmin, 260px)" }}
        >
          <span className="h-px flex-1 bg-gold/50" />
          <span style={{ fontSize: "1.1rem" }}>❖</span>
          <span className="h-px flex-1 bg-gold/50" />
        </div>
      </motion.div>
    </motion.div>
  );
}
