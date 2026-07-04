"use client";

import { useEffect, useRef, useState } from "react";

const MUSIC_VOLUME = 0.3;
const OPENING_VOLUME = 0.4;
const FADE_MS = 1800;

/* gently ramp an audio element's volume; resolves when done */
function fade(audio, to, ms) {
  return new Promise((resolve) => {
    const from = audio.volume;
    const start = performance.now();
    function step(now) {
      const t = Math.min(1, (now - start) / ms);
      audio.volume = from + (to - from) * t;
      if (t < 1) requestAnimationFrame(step);
      else resolve();
    }
    requestAnimationFrame(step);
  });
}

/**
 * The invitation's sound: a short envelope-opening whisper when the seal
 * breaks, then soft piano fading in and looping at 30%. A discreet
 * bottom-corner button lets guests fade the music out and back in.
 */
export default function MusicPlayer({ src, openingSrc, started }) {
  const musicRef = useRef(null);
  const openingRef = useRef(null);
  const startedOnce = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!started || startedOnce.current) return;
    startedOnce.current = true;

    const music = musicRef.current;
    const beginMusic = () => {
      if (!music) return;
      music.volume = 0;
      music
        .play()
        .then(() => {
          setPlaying(true);
          fade(music, MUSIC_VOLUME, FADE_MS);
        })
        .catch(() => setPlaying(false));
    };

    const opening = openingRef.current;
    if (opening) {
      opening.volume = OPENING_VOLUME;
      opening.addEventListener("ended", beginMusic, { once: true });
      opening.play().catch(() => {
        // autoplay refused: skip straight to trying the music
        opening.removeEventListener("ended", beginMusic);
        beginMusic();
      });
    } else {
      beginMusic();
    }
  }, [started]);

  async function toggle() {
    const music = musicRef.current;
    if (!music) return;
    if (playing) {
      setPlaying(false);
      await fade(music, 0, 900);
      music.pause();
    } else {
      music.volume = 0;
      try {
        await music.play();
        setPlaying(true);
        fade(music, MUSIC_VOLUME, 900);
      } catch {
        /* stays paused */
      }
    }
  }

  return (
    <>
      <audio ref={musicRef} src={src} loop preload="auto" />
      {openingSrc && <audio ref={openingRef} src={openingSrc} preload="auto" />}
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Couper la musique" : "Jouer la musique"}
        className="fixed bottom-4 right-4 z-[70] flex h-11 w-11 items-center justify-center rounded-full border border-gold/50 bg-ivory-light/90 text-gold-dark shadow-card backdrop-blur-sm transition-colors hover:bg-ivory-light"
      >
        {playing ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M9 18V6l10-2v11.5a3 3 0 1 1-2-2.83V7.6L11 9v9.5A3 3 0 1 1 9 15.7Z" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <path d="M9 18V6l10-2v11.5" />
            <circle cx="7" cy="18" r="2.4" />
            <circle cx="17" cy="15.5" r="2.4" />
            <path d="M3 3l18 18" strokeLinecap="round" />
          </svg>
        )}
      </button>
    </>
  );
}
