"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import WaxSeal from "./WaxSeal";

/**
 * Four-way split opening — choreography transcribed from the reference
 * Tilda invitation the owner picked (element sbs configs, in ms):
 *   click →  hint fades (1500)
 *            seal: delay 1000, scale→1.22 + fade over 1500
 *   2500  →  the envelope breaks into four triangular pieces meeting at
 *            the seal: left/right slide off horizontally (2000, then a
 *            500 fade), top slides up & bottom slides down (1500) —
 *            revealing the invitation behind.
 *   5100  →  overlay unmounts (parent crossfade).
 *
 * Our artwork is a single square envelope photo, so the four pieces are
 * four full-screen object-cover copies clipped to triangles that meet
 * at the seal point (49.3% height) — the split follows the envelope's
 * own X-crease geometry.
 */
const EASE = [0.22, 1, 0.36, 1];
// dev-only: slow the whole sequence down to inspect it (keep 1 in production)
const SLOW = 1;

const CX = "50%";
const CY = "49.3%"; // matches the baked seal recess of the artwork

const PIECES = [
  {
    id: "top",
    clip: `polygon(0% 0%, 100% 0%, ${CX} ${CY})`,
    open: { y: "-105%", x: "0%" },
    dur: 1.5,
    fade: false,
  },
  {
    id: "bottom",
    clip: `polygon(0% 100%, 100% 100%, ${CX} ${CY})`,
    open: { y: "105%", x: "0%" },
    dur: 1.5,
    fade: false,
  },
  {
    id: "left",
    clip: `polygon(0% 0%, ${CX} ${CY}, 0% 100%)`,
    open: { x: "-105%", y: "0%" },
    dur: 2,
    fade: true,
  },
  {
    id: "right",
    clip: `polygon(100% 0%, ${CX} ${CY}, 100% 100%)`,
    open: { x: "105%", y: "0%" },
    dur: 2,
    fade: true,
  },
];

export default function EnvelopeIntro({ data, onMountMain, onDone }) {
  const [stage, setStage] = useState("closed");
  const [hovered, setHovered] = useState(false);

  const initials = `${data.couple.groomName.trim().charAt(0)} & ${data.couple.brideName
    .trim()
    .charAt(0)}`;

  const opening = stage !== "closed";

  function open() {
    if (stage !== "closed") return;
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(12);
    setStage("opening");
    // الدعوة تُركّب خلف الظرف قبيل بدء التفكك مباشرة
    setTimeout(onMountMain, 2300 * SLOW);
    setTimeout(onDone, 5100 * SLOW);
  }

  const sealState = stage === "closed" ? "idle" : "press";

  return (
    <motion.div
      exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeOut" } }}
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* أربع قطع مثلثية من نفس صورة الظرف — تغطي الشاشة كاملة وهي مغلقة،
          وتتفكك في أربعة اتجاهات عند الفتح (توقيتات المرجع حرفيًا) */}
      {PIECES.map((p) => (
        <motion.div
          key={p.id}
          aria-hidden
          initial={false}
          animate={
            opening
              ? {
                  ...p.open,
                  opacity: p.fade ? [1, 1, 0] : 1,
                  transition: {
                    x: { delay: 2.5 * SLOW, duration: p.dur * SLOW, ease: "easeInOut" },
                    y: { delay: 2.5 * SLOW, duration: p.dur * SLOW, ease: "easeInOut" },
                    opacity: {
                      delay: 2.5 * SLOW,
                      duration: (p.dur + 0.5) * SLOW,
                      times: [0, 0.8, 1],
                    },
                  },
                }
              : { x: "0%", y: "0%", opacity: 1 }
          }
          className="absolute inset-0"
          style={{ clipPath: p.clip, willChange: "transform" }}
        >
          <img
            src={data.assets.envelopeClosed}
            alt={p.id === "top" ? "Enveloppe scellée" : ""}
            draggable={false}
            className="h-full w-full select-none object-cover"
          />
          {/* حافة ورقية خفيفة على خط القص حتى تبدو القطع حقيقية */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ boxShadow: "inset 0 0 24px rgb(var(--color-ink) / 0.06)" }}
          />
        </motion.div>
      ))}

      {/* توهج دافئ يتنفس فوق الورق */}
      <motion.div
        aria-hidden
        animate={{ opacity: opening ? 0 : hovered ? 0.45 : 0.22 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 38%, rgb(var(--color-gold-light) / 0.5), transparent 60%)",
          mixBlendMode: "soft-light",
        }}
      />

      {/* الختم الذهبي — ضغطة، ثم تضخم ×1.22 وتلاشٍ (منحنى المرجع) */}
      <motion.div
        animate={
          opening
            ? {
                scale: 1.22,
                opacity: 0,
                transition: { delay: 1.0 * SLOW, duration: 1.5 * SLOW, ease: "easeInOut" },
              }
            : { scale: 1, opacity: 1 }
        }
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        className="absolute z-40 w-[min(34vmin,190px)]"
        style={{ left: "50%", top: CY, x: "-50%", y: "-50%" }}
      >
        <WaxSeal
          src={data.assets.envelopeSeal}
          initials={initials}
          state={sealState}
          onOpen={open}
          fontSize="clamp(1.3rem, 5vmin, 2rem)"
          flat
        />
      </motion.div>
    </motion.div>
  );
}
