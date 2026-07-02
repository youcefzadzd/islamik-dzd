"use client";

import Reveal from "./Reveal";

export default function ScheduleSection({ data }) {
  const schedule = data.schedule;

  return (
    <section className="relative overflow-hidden bg-ivory px-6 py-20">
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "url(/assets/paper-texture.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="relative invite-card">
        <Reveal>
          <h2 className="text-center font-monogram text-4xl text-gold-dark sm:text-5xl">
            {schedule.heading}
          </h2>
          <div className="divider mt-4">
            <span className="text-gold">❦</span>
          </div>
        </Reveal>

        <div className="mt-12">
          {schedule.items.map((step, index) => (
            <Reveal key={`${step.time}-${step.title}`} delay={index * 0.08}>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-5">
                <p className="text-right font-serif text-2xl text-ink/85">{step.time}</p>
                <div className="flex flex-col items-center self-stretch">
                  <span className="w-px flex-1 bg-gold/40" />
                  <span className="my-1 h-2 w-2 rotate-45 bg-gold-dark" />
                  <span className="w-px flex-1 bg-gold/40" />
                </div>
                <div>
                  <p className="font-serif text-xl text-burgundy">{step.title}</p>
                  {step.description ? (
                    <p className="mt-1 font-body text-sm text-ink/70">{step.description}</p>
                  ) : null}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
