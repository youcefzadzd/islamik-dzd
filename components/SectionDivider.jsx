"use client";

import { motion, useReducedMotion } from "framer-motion";
import { DividerOrnament } from "./ornaments";

const EASE = [0.22, 1, 0.36, 1];

/* five slow white petals, spread around the ornament */
const PETALS = [
  { offset: -92, dx: "-14px", dur: 6.6, delay: 0.4, size: 9, po: 0.7, rot: "150deg" },
  { offset: -38, dx: "10px", dur: 7.6, delay: 2.2, size: 7, po: 0.55, rot: "210deg" },
  { offset: 4, dx: "-8px", dur: 6.9, delay: 1.1, size: 10, po: 0.75, rot: "170deg" },
  { offset: 46, dx: "13px", dur: 8.1, delay: 3.1, size: 8, po: 0.6, rot: "190deg" },
  { offset: 88, dx: "-11px", dur: 7.3, delay: 0.9, size: 9, po: 0.65, rot: "160deg" },
];

/**
 * The page-turn of the invitation: a centered gold ornament with a jewel,
 * champagne lines, a soft glow, drifting white petals and one shimmer
 * pass when it enters the viewport.
 */
export default function SectionDivider() {
  const reduce = useReducedMotion();

  return (
    <div aria-hidden className="relative flex items-center justify-center px-10 py-4">
      {/* petals drifting down through the transition */}
      {!reduce && (
        <div className="pointer-events-none absolute inset-x-0 -top-4 h-28 overflow-hidden">
          {PETALS.map((p) => (
            <span
              key={p.offset}
              className="divider-petal"
              style={{
                left: `calc(50% + ${p.offset}px)`,
                "--dx": p.dx,
                "--dur": `${p.dur}s`,
                "--delay": `${p.delay}s`,
                "--po": p.po,
                "--rot": p.rot,
              }}
            >
              <svg width={p.size} height={p.size} viewBox="0 0 24 24">
                <path
                  d="M12 2 C17.5 6.5 19 12.5 12 22 C5 12.5 6.5 6.5 12 2 Z"
                  fill="#FFFFFF"
                  stroke="#D8BD7A"
                  strokeWidth="0.6"
                  fillOpacity="0.9"
                />
              </svg>
            </span>
          ))}
        </div>
      )}

      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.9, ease: EASE }}
        className="relative flex w-full max-w-sm items-center gap-3"
      >
        {/* soft gold glow behind the ornament */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-14 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
          style={{ background: "radial-gradient(ellipse, rgb(216 189 122 / 0.4), transparent 70%)" }}
        />

        {/* thin champagne lines reaching out */}
        <div
          className="h-px flex-1"
          style={{ background: "linear-gradient(to left, rgb(198 161 91 / 0.75), transparent)" }}
        />

        {/* ornament with a single shimmer pass on arrival */}
        <div className="relative overflow-hidden">
          <DividerOrnament className="h-6 w-28" />
          {!reduce && (
            <motion.div
              initial={{ x: "-130%", opacity: 0 }}
              whileInView={{ x: "130%", opacity: [0, 0.8, 0] }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 1.2, delay: 0.55, ease: "easeInOut" }}
              className="absolute inset-y-0 left-0 w-2/3"
              style={{
                background:
                  "linear-gradient(105deg, transparent 20%, rgb(255 250 235 / 0.9) 50%, transparent 80%)",
              }}
            />
          )}
        </div>

        <div
          className="h-px flex-1"
          style={{ background: "linear-gradient(to right, rgb(198 161 91 / 0.75), transparent)" }}
        />
      </motion.div>
    </div>
  );
}
