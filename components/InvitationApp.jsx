"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { getData } from "@/lib/i18n";
import { buildThemeCssVariables } from "@/lib/theme";
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

export default function InvitationApp({ weddingIdOverride, initialData }) {
  // mountMain: the page is rendered AND revealed early under the opaque
  // envelope, so its entrance finishes unseen and the envelope's fade
  // lands on an already-settled hero — no second "page builds itself" beat.
  const [mountMain, setMountMain] = useState(false);
  const [opened, setOpened] = useState(false);

  // language: the wedding's default, guest choice remembered across visits
  const defaultLang = initialData?.fr?.defaultLang || "fr";
  const enabledLangs = initialData?.fr?.enabledLangs || ["fr", "ar"];
  const [lang, setLang] = useState(defaultLang);
  const [textFading, setTextFading] = useState(false);
  const data = useMemo(() => {
    const base = initialData ? initialData[lang] || initialData.fr : getData(lang);
    // /w/[weddingId] links scope RSVP responses to the wedding in the URL
    return weddingIdOverride
      ? { ...base, rsvp: { ...base.rsvp, weddingId: weddingIdOverride } }
      : base;
  }, [lang, weddingIdOverride, initialData]);

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved && saved !== defaultLang && enabledLangs.includes(saved)) setLang(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      {/* per-wedding theme colors (platform weddings only) */}
      {initialData && (
        <style
          dangerouslySetInnerHTML={{
            __html: `:root { ${buildThemeCssVariables(data.theme.colors)} }`,
          }}
        />
      )}

      {/* language switcher — always visible, above every overlay */}
      {enabledLangs.length > 1 && (
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
      )}

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

          <HeroSection data={data} revealed={mountMain} />
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
