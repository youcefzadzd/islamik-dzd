"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import EnvelopeIntro from "./EnvelopeIntro";
import SectionDivider from "./SectionDivider";
import { Rosette } from "./ornaments";
import HeroSection from "./HeroSection";
import IntroSection from "./IntroSection";
import CountdownSection from "./CountdownSection";
import ScheduleSection from "./ScheduleSection";
import LocationSection from "./LocationSection";
import GallerySection from "./GallerySection";
import RsvpSection from "./RsvpSection";
import ThankYouSection from "./ThankYouSection";

export default function InvitationApp({ data }) {
  // mountMain: the page is rendered under the overlay just before the paper expands,
  // so the crossfade lands on an already-painted hero.
  const [mountMain, setMountMain] = useState(false);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    document.body.style.overflow = opened ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [opened]);

  return (
    <>
      <AnimatePresence>
        {!opened && (
          <EnvelopeIntro
            data={data}
            onMountMain={() => setMountMain(true)}
            onDone={() => setOpened(true)}
          />
        )}
      </AnimatePresence>

      {mountMain && (
        <main className="page-paper relative">
          {/* one continuous sheet of handmade paper behind every page */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="paper-tile" />
            {/* faint Moroccan geometric watermarks along the scroll */}
            {[12, 26, 41, 55, 70, 85].map((top, i) => (
              <Rosette
                key={top}
                size={i % 2 ? 230 : 300}
                className={`absolute opacity-[0.05] ${
                  i % 2 ? "-right-24" : "-left-24"
                }`}
                style={{ top: `${top}%` }}
              />
            ))}
          </div>

          <HeroSection data={data} revealed={opened} />
          <div className="relative pb-8 pt-4">
            <SectionDivider />
            <IntroSection data={data} />
            <SectionDivider />
            <CountdownSection data={data} />
            <SectionDivider />
            <ScheduleSection data={data} />
            <SectionDivider />
            <LocationSection data={data} />
            <SectionDivider />
            <GallerySection data={data} />
            <SectionDivider />
            <RsvpSection data={data} />
            <SectionDivider />
          </div>
          <ThankYouSection data={data} />
        </main>
      )}
    </>
  );
}
