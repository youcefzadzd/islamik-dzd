"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/**
 * Handcrafted sealing-wax look, built from the wax PNG + masked CSS layers:
 * bevel + inner shadows, glossy reflections, translucent rim, paper-grain
 * noise, ambient/contact shadows, wax droplets around the edge, and gold
 * embossed dynamic initials. On click the wax cracks into two shards.
 *
 * state: "idle" | "press" | "crack"
 */
const SPRING = { type: "spring", stiffness: 320, damping: 22, mass: 0.6 };

// jagged fracture line through the wax, as two complementary shards
const SHARD_LEFT =
  "polygon(0% 0%, 48% 0%, 42% 18%, 52% 34%, 44% 52%, 55% 68%, 47% 84%, 50% 100%, 0% 100%)";
const SHARD_RIGHT =
  "polygon(48% 0%, 100% 0%, 100% 100%, 50% 100%, 47% 84%, 55% 68%, 44% 52%, 52% 34%, 42% 18%)";

function waxMask(src) {
  return {
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
  };
}

/* the wax disc itself: image + sculpting light layers, reused by the shards */
function WaxBody({ src, initials, fontSize, glossOpacity = 0.55, flat = false }) {
  if (flat) {
    // photographic seal: the artwork already carries its own depth
    return <img src={src} alt="" className="block w-full select-none" draggable={false} />;
  }
  return (
    <>
      <img src={src} alt="" className="block w-full select-none" draggable={false} />

      {/* bevel: darkened rim + soft top light, following the wavy silhouette */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          ...waxMask(src),
          background:
            "radial-gradient(circle at 50% 42%, transparent 42%, rgb(40 6 12 / 0.34) 72%, rgb(22 3 8 / 0.5) 93%)," +
            "radial-gradient(circle at 50% 18%, rgb(255 255 255 / 0.16), transparent 42%)",
        }}
      />

      {/* slight translucency on the outer edges — light bleeding through thin wax */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          ...waxMask(src),
          background:
            "radial-gradient(circle at 50% 50%, transparent 58%, rgb(var(--color-burgundy-light) / 0.55) 88%)",
          mixBlendMode: "screen",
        }}
      />

      {/* glossy reflection, brightens on hover */}
      <motion.div
        aria-hidden
        animate={{ opacity: glossOpacity }}
        transition={{ duration: 0.35 }}
        className="absolute inset-0"
        style={{
          ...waxMask(src),
          background:
            "radial-gradient(ellipse at 32% 26%, rgb(255 255 255 / 0.5), rgb(255 255 255 / 0.12) 30%, transparent 50%)," +
            "linear-gradient(145deg, transparent 55%, rgb(255 255 255 / 0.14) 66%, transparent 78%)",
          mixBlendMode: "screen",
        }}
      />

      {/* melted-wax micro texture (grain borrowed from the paper asset —
          cheaper to composite than generated SVG noise) */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          ...waxMask(src),
          backgroundImage: "url(/assets/paper-texture.webp)",
          backgroundSize: "160%",
          backgroundPosition: "center",
          mixBlendMode: "overlay",
          opacity: 0.3,
        }}
      />

      {/* gold embossed initials, engraved into the wax */}
      <span
        className="absolute inset-0 flex items-center justify-center pb-[6%] font-monogram"
        style={{
          fontSize,
          backgroundImage:
            "linear-gradient(165deg, #F5EBCB 0%, #E3CE93 35%, #C6A15B 60%, #A6813F 75%, #E7D6A8 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          filter:
            "drop-shadow(0 -1px 0.5px rgb(30 4 9 / 0.9)) drop-shadow(0 1px 1px rgb(255 228 160 / 0.4))",
        }}
      >
        {initials}
      </span>
    </>
  );
}

export default function WaxSeal({ src, initials, state, onOpen, fontSize, flat = false }) {
  // flat: the seal artwork is already photographic (e.g. the gold bismillah
  // seal) — keep every interaction but skip the CSS sculpting and initials
  const idle = state === "idle";
  const cracked = state === "crack";
  const reduce = useReducedMotion();

  const buttonAnimate =
    state === "press"
      ? {
          scale: [1, 0.96, 1.005, 0.97],
          rotate: [0, -1, 1, -0.6, 0],
          x: [0, -1.2, 1.2, -0.6, 0],
          transition: { duration: 0.25, ease: "easeOut" },
        }
      : idle && !reduce
        ? {
            // gentle breathing: invites the tap without shouting
            scale: [1, 1.025, 1],
            rotate: 0,
            x: 0,
            transition: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
          }
        : { scale: 1, rotate: 0, x: 0, transition: SPRING };

  return (
    <motion.button
      type="button"
      aria-label="Ouvrir l'invitation"
      animate={buttonAnimate}
      whileHover={idle ? { scale: 1.04, rotate: 1, transition: SPRING } : undefined}
      whileTap={idle ? { scale: 0.96, transition: SPRING } : undefined}
      onClick={onOpen}
      className="relative block w-full cursor-pointer outline-none"
    >
      {/* soft golden halo pulsing behind the seal — the "tap me" cue */}
      <motion.div
        aria-hidden
        animate={
          idle && !reduce
            ? { opacity: [0.25, 0.6, 0.25], scale: [1.05, 1.14, 1.05] }
            : { opacity: idle ? 0.35 : 0, scale: 1.08 }
        }
        transition={
          idle && !reduce
            ? { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.3 }
        }
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgb(216 189 122 / 0.45) 30%, rgb(216 189 122 / 0.18) 58%, transparent 72%)",
          filter: "blur(10px)",
        }}
      />

      {/* ambient shadow underneath */}
      <motion.div
        aria-hidden
        animate={{ opacity: cracked ? 0 : 1 }}
        transition={{ duration: 0.3, delay: cracked ? 0.15 : 0 }}
        className="absolute left-1/2 top-[84%] h-[22%] w-[92%] -translate-x-1/2 rounded-[50%]"
        style={{
          background: flat ? "rgb(80 55 35 / 0.22)" : "rgb(var(--color-burgundy-dark) / 0.4)",
          filter: "blur(10px)",
        }}
      />
      {/* tight contact shadow where the wax meets the paper */}
      <motion.div
        aria-hidden
        animate={{ opacity: cracked ? 0 : 1 }}
        transition={{ duration: 0.25, delay: cracked ? 0.1 : 0 }}
        className="absolute left-1/2 top-[88%] h-[12%] w-[78%] -translate-x-1/2 rounded-[50%]"
        style={{
          background: flat ? "rgb(60 40 25 / 0.28)" : "rgb(20 3 8 / 0.5)",
          filter: "blur(4px)",
        }}
      />

      {/* whole seal (hidden the instant it cracks) */}
      <div className="relative" style={{ opacity: cracked ? 0 : 1 }}>
        <WaxBody src={src} initials={initials} fontSize={fontSize} glossOpacity={idle ? 0.55 : 0.8} flat={flat} />

        {/* handmade imperfections: stray wax droplets at the rim */}
        {!flat && [
          { left: "9%", top: "40%", w: "4.5%", h: "3.8%" },
          { right: "7.5%", top: "58%", w: "3.8%", h: "3.2%" },
          { left: "55%", bottom: "3.5%", w: "3.2%", h: "2.8%" },
        ].map((d, i) => (
          <div
            key={i}
            aria-hidden
            className="absolute rounded-full"
            style={{
              ...d,
              width: d.w,
              paddingBottom: d.h,
              background:
                "radial-gradient(circle at 35% 30%, rgb(var(--color-burgundy-light)), rgb(var(--color-burgundy-dark)) 75%)",
              boxShadow: "0 1px 2px rgb(20 3 8 / 0.45), inset 0 1px 1px rgb(255 255 255 / 0.25)",
              opacity: 0.9,
            }}
          />
        ))}
      </div>

      {/* the crack: the wax splits into two shards and falls away */}
      <AnimatePresence>
        {cracked && (
          <>
            <motion.div
              key="left"
              initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
              animate={{ x: -5, y: 3, rotate: -2, opacity: 0 }}
              transition={{ duration: 0.38, ease: "easeOut" }}
              className="absolute inset-0"
              style={{ clipPath: SHARD_LEFT }}
            >
              <WaxBody src={src} initials={initials} fontSize={fontSize} glossOpacity={0.5} flat={flat} />
            </motion.div>
            <motion.div
              key="right"
              initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
              animate={{ x: 5, y: 2, rotate: 1.6, opacity: 0 }}
              transition={{ duration: 0.38, ease: "easeOut" }}
              className="absolute inset-0"
              style={{ clipPath: SHARD_RIGHT }}
            >
              <WaxBody src={src} initials={initials} fontSize={fontSize} glossOpacity={0.5} flat={flat} />
            </motion.div>
            {/* fracture flash along the break line */}
            <motion.svg
              key="crackline"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.9, 0] }}
              transition={{ duration: 0.3, times: [0, 0.3, 1] }}
              className="absolute inset-0 h-full w-full"
            >
              <polyline
                points="48,0 42,18 52,34 44,52 55,68 47,84 50,100"
                fill="none"
                stroke="rgb(255 240 220 / 0.9)"
                strokeWidth="0.8"
              />
            </motion.svg>
          </>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
