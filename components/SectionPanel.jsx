"use client";

import { CornerOrnament, CardFlourish } from "./ornaments";

/**
 * One page of the invitation: every section sits in the same handmade
 * paper panel — 28px corners, champagne hairline, arabesque corners,
 * inner frame and a calligraphic flourish on top.
 */
export default function SectionPanel({ children, className = "" }) {
  return (
    <section className="relative px-4 py-7 sm:px-6">
      <div className={`lux-panel mx-auto w-full max-w-[34rem] px-6 py-12 sm:px-9 ${className}`}>
        <CornerOrnament className="pointer-events-none absolute left-1 top-1 w-16 sm:w-20" />
        <CornerOrnament className="pointer-events-none absolute right-1 top-1 w-16 -scale-x-100 sm:w-20" />
        <CornerOrnament className="pointer-events-none absolute bottom-1 left-1 w-16 -scale-y-100 sm:w-20" />
        <CornerOrnament className="pointer-events-none absolute bottom-1 right-1 w-16 -scale-x-100 -scale-y-100 sm:w-20" />
        <div className="relative flex justify-center pb-6">
          <CardFlourish />
        </div>
        <div className="relative">{children}</div>
      </div>
    </section>
  );
}
