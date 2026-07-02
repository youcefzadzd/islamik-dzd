"use client";

import { useId } from "react";
import { buildStarPoints } from "./geometry";

/**
 * A very subtle repeating geometric watermark, built from pure SVG (no
 * images). Meant to sit behind content at low opacity for texture only.
 */
export default function PatternBackdrop({ className = "" }) {
  const patternId = `islamic-pattern-${useId()}`;
  const points = buildStarPoints(30, 30, 8, 24, 13);

  return (
    <svg
      className={className}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id={patternId} width="60" height="60" patternUnits="userSpaceOnUse">
          <polygon points={points} fill="none" stroke="currentColor" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
