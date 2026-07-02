"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import EnvelopeIntro from "./EnvelopeIntro";
import HeroSection from "./HeroSection";
import IntroSection from "./IntroSection";
import CountdownSection from "./CountdownSection";
import ScheduleSection from "./ScheduleSection";
import LocationSection from "./LocationSection";
import VideoSection from "./VideoSection";
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
        <main className="relative">
          <HeroSection data={data} revealed={opened} />
          <IntroSection data={data} />
          <CountdownSection data={data} />
          <ScheduleSection data={data} />
          <LocationSection data={data} />
          <VideoSection data={data} />
          <GallerySection data={data} />
          <RsvpSection data={data} />
          <ThankYouSection data={data} />
        </main>
      )}
    </>
  );
}
