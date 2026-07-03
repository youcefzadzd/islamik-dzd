"use client";

import Reveal from "./Reveal";
import SectionPanel from "./SectionPanel";
import { StarNode, CardFlourish } from "./ornaments";

export default function ScheduleSection({ data }) {
  const schedule = data.schedule;
  const items = schedule.items;

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

      <div className="relative mt-10">
        {/* the gold spine of the day */}
        <div
          aria-hidden
          className="absolute bottom-2 left-1/2 top-2 w-px -translate-x-1/2"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgb(var(--color-gold) / 0.65) 7%, rgb(var(--color-gold) / 0.65) 93%, transparent)",
          }}
        />
        {/* small ornaments closing the spine */}
        <span aria-hidden className="absolute -top-1 left-1/2 -translate-x-1/2 text-[10px] text-gold">
          ◆
        </span>
        <span aria-hidden className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-gold">
          ◆
        </span>

        {items.map((step, index) => (
          <Reveal key={`${step.time}-${step.title}`} delay={index * 0.12}>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-5 sm:gap-4">
              <p className="min-w-0 text-right font-serif text-xl text-ink/85 sm:text-2xl">{step.time}</p>
              <span className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full border border-gold/50 bg-ivory-light shadow-card">
                <StarNode className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 text-left">
                <p className="font-serif text-lg text-burgundy sm:text-xl">{step.title}</p>
                {step.description ? (
                  <p className="mt-1 font-body text-sm text-ink/70">{step.description}</p>
                ) : null}
              </div>
            </div>
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
