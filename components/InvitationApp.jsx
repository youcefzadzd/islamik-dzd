"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { getData } from "@/lib/i18n";
import EnvelopeIntro from "./EnvelopeIntro";
import MusicPlayer from "./MusicPlayer";
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

export default function InvitationApp() {
  // mountMain: the page is rendered under the overlay just before the paper expands,
  // so the crossfade lands on an already-painted hero.
  const [mountMain, setMountMain] = useState(false);
  const [opened, setOpened] = useState(false);

  // language: French by default, Arabic remembered across visits
  const [lang, setLang] = useState("fr");
  const [textFading, setTextFading] = useState(false);
  const data = useMemo(() => getData(lang), [lang]);

  useEffect(() => {
    if (localStorage.getItem("lang") === "ar") setLang("ar");
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  function switchLang() {
    const next = lang === "fr" ? "ar" : "fr";
    setTextFading(true);
    setTimeout(() => {
      setLang(next);
      localStorage.setItem("lang", next);
      setTextFading(false);
    }, 200);
  }

  useEffect(() => {
    document.body.style.overflow = opened ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [opened]);

  return (
    <>
      {/* language switcher — always visible, above every overlay */}
      <button
        type="button"
        onClick={switchLang}
        className={`fixed right-4 top-4 z-[70] rounded-full border border-gold/50 bg-ivory-light/90 px-4 py-1.5 text-sm text-gold-dark shadow-card backdrop-blur-sm transition-colors hover:bg-ivory-light ${
          lang === "fr" ? "font-arabicText" : "font-body"
        }`}
        aria-label={lang === "fr" ? "التبديل إلى العربية" : "Passer au français"}
      >
        {lang === "fr" ? "العربية" : "Français"}
      </button>

      <div
        className={`transition-opacity duration-300 ${textFading ? "opacity-0" : "opacity-100"}`}
      >
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
            {data.rsvp.enabled && (
              <>
                <RsvpSection data={data} />
                <SectionDivider />
              </>
            )}
          </div>
          <ThankYouSection data={data} />
        </main>
      )}

      {/* background music, only when a track is set in the config */}
      {data.music && (
        <MusicPlayer src={data.music} openingSrc={data.openingSound} started={mountMain} />
      )}
      </div>
    </>
  );
}
