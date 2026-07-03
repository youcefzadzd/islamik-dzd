"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Discreet background-music toggle (only rendered when media.music is set
 * in wedding-config.json). Playback starts after the guest opens the
 * envelope; browsers that refuse autoplay simply leave the button paused.
 */
export default function MusicPlayer({ src, started }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!started || !audioRef.current) return;
    audioRef.current
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, [started]);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  }

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="none" />
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
