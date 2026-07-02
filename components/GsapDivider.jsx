"use client";

import { useEffect, useRef } from "react";
import EightPointStar from "./ornaments/EightPointStar";

/**
 * A gold line that draws itself in from both sides as it scrolls into
 * view, with the 8-point star fading in at the center. Uses GSAP +
 * ScrollTrigger (Framer Motion handles the rest of the site's motion).
 */
export default function GsapDivider({ className = "" }) {
  const containerRef = useRef(null);
  const leftLineRef = useRef(null);
  const rightLineRef = useRef(null);
  const starRef = useRef(null);

  useEffect(() => {
    let ctx;
    let mounted = true;

    (async () => {
      const gsapModule = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      const gsap = gsapModule.default;
      gsap.registerPlugin(ScrollTrigger);

      if (!mounted) return;

      ctx = gsap.context(() => {
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });

        timeline
          .fromTo(leftLineRef.current, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power2.out" })
          .fromTo(rightLineRef.current, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power2.out" }, "<")
          .fromTo(
            starRef.current,
            { scale: 0, rotate: -45, opacity: 0 },
            { scale: 1, rotate: 0, opacity: 1, duration: 0.5, ease: "back.out(2)" },
            "-=0.3"
          );
      }, containerRef);
    })();

    return () => {
      mounted = false;
      if (ctx) ctx.revert();
    };
  }, []);

  return (
    <div ref={containerRef} className={`flex items-center justify-center gap-4 ${className}`}>
      <span
        ref={leftLineRef}
        className="h-px w-16 origin-right bg-gradient-to-r from-transparent to-gold"
      />
      <span ref={starRef} className="text-gold">
        <EightPointStar size={20} />
      </span>
      <span
        ref={rightLineRef}
        className="h-px w-16 origin-left bg-gradient-to-l from-transparent to-gold"
      />
    </div>
  );
}
