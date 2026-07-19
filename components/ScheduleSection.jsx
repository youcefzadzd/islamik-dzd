"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import Reveal from "./Reveal";
import SectionPanel from "./SectionPanel";
import { StarNode, CardFlourish } from "./ornaments";

/* محطة واحدة: عند وصول النجمة إليها يرتفع الوقت والعنوان معًا
   قليلًا ويتقدّمان، ثم يعودان بهدوء بعد مرورها */
function ScheduleRow({ step, progress, center, span, nodeRef }) {
  const lift = useTransform(progress, [center - span, center, center + span], [0, -7, 0]);
  const scale = useTransform(progress, [center - span, center, center + span], [1, 1.07, 1]);
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-5 sm:gap-4">
      {/* الكتابة وحدها ترتفع — العقدة ثابتة فتبقى النجمة المسافرة
          في مركزها تمامًا */}
      <motion.p
        style={{ y: lift, scale }}
        className="min-w-0 text-end font-serif text-xl text-ink/85 sm:text-2xl"
      >
        {step.time}
      </motion.p>
      <span
        ref={nodeRef}
        className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full border border-gold/50 bg-ivory-light shadow-card"
      >
        <StarNode className="h-3.5 w-3.5" />
      </span>
      <motion.div style={{ y: lift, scale }} className="min-w-0 text-start">
        <p className="font-serif text-lg text-burgundy sm:text-xl">{step.title}</p>
        {step.description ? (
          <p className="mt-1 font-body text-sm text-ink/70">{step.description}</p>
        ) : null}
      </motion.div>
    </div>
  );
}

export default function ScheduleSection({ data }) {
  const schedule = data.schedule;
  const items = schedule.items;

  /* النجمة المسافرة: تنزلق على العمود الذهبي مع التمرير —
     تهبط بنزوله وتصعد بطلوعه، بنعومة زنبركية */
  const spineRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: spineRef,
    offset: ["start 78%", "end 40%"],
  });
  /* النجمة لا تسكن بين المحطات: يُقرَّب تقدم التمرير إلى أقرب
     محطة (خانة الوقت والعنوان) فتقفز إليها مباشرة، والزنبرك
     يجعل القفزة نفسها انسيابية */
  const centersRef = useRef(null);
  const snapped = useTransform(scrollYProgress, (v) => {
    const cs = centersRef.current;
    if (!cs || !cs.length) return v;
    let best = cs[0];
    for (const c of cs) if (Math.abs(c - v) < Math.abs(best - v)) best = c;
    return best;
  });
  const progress = useSpring(snapped, { stiffness: 90, damping: 20, mass: 0.4 });
  const starTop = useTransform(progress, (v) => `${2 + v * 94}%`);

  /* مواضع مراكز المحطات على العمود (كنسبة من مسار النجمة) —
     تُقاس من التخطيط الفعلي فتبقى دقيقة مهما اختلفت أطوال الأوصاف */
  const rowRefs = useRef([]);
  const [centers, setCenters] = useState(null);
  useEffect(() => {
    const measure = () => {
      const c = spineRef.current;
      if (!c || !c.offsetHeight) return;
      // القياس يستهدف دائرة نجمة المحطة نفسها، فتحطّ النجمة
      // المسافرة في مركزها تمامًا — جمع offsetTop عبر السلسلة حتى
      // العمود: قياس تخطيطي محض لا تشوّشه تحويلات Reveal المؤقتة
      const next = rowRefs.current.slice(0, items.length).map((el, i) => {
        if (!el) return (i + 0.5) / items.length;
        let top = 0;
        let n = el;
        while (n && n !== c) {
          top += n.offsetTop;
          n = n.offsetParent;
        }
        const frac = (top + el.offsetHeight / 2) / c.offsetHeight;
        return (frac * 100 - 2) / 94; // نفس معادلة موضع النجمة
      });
      centersRef.current = next;
      setCenters(next);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [items.length]);

  const span = 0.55 / Math.max(items.length, 1);

  return (
    <SectionPanel>
      <div className="text-center">
        <Reveal>
          <h2 className="font-monogram text-4xl text-gold-dark sm:text-5xl">
            {schedule.heading}
          </h2>
          <div className="divider mt-5">
            <span className="text-gold">✦</span>
          </div>
        </Reveal>
      </div>

      <div ref={spineRef} className="relative mt-10">
        {/* the gold spine of the day */}
        <div
          aria-hidden
          className="absolute bottom-2 left-1/2 top-2 w-px -translate-x-1/2"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgb(var(--color-gold) / 0.65) 7%, rgb(var(--color-gold) / 0.65) 93%, transparent)",
          }}
        />
        {/* النجمة المتوهجة المسافرة على العمود */}
        {/* z-20 فوق عقد المحطات (z-10): النجمة تحطّ فوق نجمة المحطة
            وتغطّيها بدل الاختفاء خلف دائرتها */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute left-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
          style={{ top: starTop }}
        >
          <span
            className="absolute h-9 w-9 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgb(var(--color-gold) / 0.5), rgb(var(--color-gold) / 0.15) 55%, transparent 72%)",
              filter: "blur(2px)",
            }}
          />
          <span
            className="relative text-lg text-gold"
            style={{ textShadow: "0 0 8px rgb(var(--color-gold) / 0.8)" }}
          >
            ✦
          </span>
        </motion.span>
        {/* small ornaments closing the spine */}
        <span aria-hidden className="absolute -top-1 left-1/2 -translate-x-1/2 text-[10px] text-gold">
          ◆
        </span>
        <span aria-hidden className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-gold">
          ◆
        </span>

        {items.map((step, index) => (
          <Reveal key={`${step.time}-${step.title}`} delay={index * 0.12}>
            <ScheduleRow
              step={step}
              progress={progress}
              center={centers ? centers[index] : (index + 0.5) / items.length}
              span={span}
              nodeRef={(el) => (rowRefs.current[index] = el)}
            />
            {index < items.length - 1 ? (
              <div aria-hidden className="flex justify-center">
                <span className="text-[9px] tracking-[0.6em] text-gold/60">✦</span>
              </div>
            ) : null}
          </Reveal>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <CardFlourish />
      </div>
    </SectionPanel>
  );
}
