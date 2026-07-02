"use client";

import { useEffect, useState } from "react";
import Reveal from "./Reveal";

function remaining(targetDateISO) {
  const diff = new Date(targetDateISO).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor(diff / 3600000) % 24,
    minutes: Math.floor(diff / 60000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  };
}

export default function CountdownSection({ data }) {
  const countdown = data.countdown;
  // null until mounted so the server render never mismatches the client clock
  const [time, setTime] = useState(undefined);

  useEffect(() => {
    const tick = () => setTime(remaining(data.event.dateTimeISO));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [data.event.dateTimeISO]);

  const units = ["days", "hours", "minutes", "seconds"];

  return (
    <section className="bg-ivory-dark/60 px-6 py-20">
      <div className="invite-card text-center">
        <Reveal>
          <h2 className="font-monogram text-4xl text-gold-dark sm:text-5xl">{countdown.heading}</h2>
        </Reveal>

        <Reveal delay={0.2}>
          {time === null ? (
            <p className="mt-10 font-serif text-2xl text-burgundy">{countdown.expiredText}</p>
          ) : (
            <div className="mt-10 grid grid-cols-4 gap-2">
              {units.map((unit) => (
                <div key={unit} className="flex flex-col items-center">
                  <span className="font-serif text-4xl text-gold-dark tabular-nums sm:text-5xl">
                    {time ? String(time[unit]).padStart(2, "0") : "--"}
                  </span>
                  <span className="mt-2 font-body text-sm text-ink/70">{countdown.labels[unit]}</span>
                </div>
              ))}
            </div>
          )}
        </Reveal>

        <Reveal delay={0.35}>
          <div className="mt-10 flex items-center justify-center gap-4 font-serif text-lg text-ink/80">
            <span>{data.event.displayDay}</span>
            <span className="text-gold">✦</span>
            <span>{data.event.displayDate}</span>
            <span className="text-gold">✦</span>
            <span>{data.event.displayTime}</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
