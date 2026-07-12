# Project Status

> Quick-start reference for continuing Claude sessions. Read this first.

**Project root:** `E:\CLAUDE CODE INV\templates\islamic-royal`
**GitHub:** youcefzadzd/islamik-dzd
**Stack:** Next.js + Supabase + Vercel

## Version: 2.0

The project is at **production status**. Rules for all future work:

- Do not rebuild anything — improve step by step only.
- Always preserve backward compatibility.
- Never break existing functionality.
- Never redesign features unless explicitly requested.

## Completed

- Public invitation
- Owner dashboard
- Client dashboard
- RSVP
- RSVP companions system (owner-controlled: allow/max/children; named companions; dashboard stats + CSV) — requires `supabase/companions-migration.sql`
- Media Upload (owner media/music libraries on Supabase Storage; upload/replace/delete; wired into the wizard for hero, thank-you, gallery, music, opening sound)
- Template System foundation (registry in `lib/templates.js`; selection in wizard Design step; stored as `theme.template` in the existing jsonb — no migration; renderer dispatch in `app/w/[weddingId]/page.js`; old rows default to Islamic Royal)
- Heritage template (`components/heritage/` — rebuilt to the owner's reference screenshots in `C:\Users\DZ TECH\Downloads\theme 2`: embossed sage envelope with gold Arabic welcome + terracotta seal, full-photo hero with glass countdown, cream gallery, dark-olive Day Program with icon timeline + beige time chips, details card with Maps/Calendar buttons, boxed RSVP form with olive submit, tan Questions card, olive footer with auto hashtag; own fixed palette (ignores owner theme colors); FR/AR + RTL; same data model and rsvp_responses contract; demo wedding WED-KXZGMF)
- Floral Romantic template (`components/floral-romantic/` — cinematic envelope intro rebuilt from the owner's reference videos: the closed state is a single AI-generated photograph (envelope-closed.webp): a full-bleed classic burgundy embossed-rose envelope with visible X folds, the AI-generated gold wax seal (rings + crown crest) overlaid at dead center; on tap the photo separates into two pieces (owner's exact spec): the RIGHT piece is a pure triangle whose TIP sits at dead center exactly under the wax seal — it is pulled straight out to the right with the seal riding its tip; then the LEFT piece (its right edge a "<" notch starting at center) is pulled out to the left; pieces overlap while closed so the envelope reads as one seamless surface; soft light on the letter being revealed — clip geometry, seal-on-tip centering and attachment verified by static-transform measurements; both halves are pulled out SIMULTANEOUSLY (owner's spec); the reveal behind the envelope is a CINEMATIC 6s one-take journey (reveal-scene.mp4): the camera glides forward through flowered marble colonnades and settles on the grand arch composition with golden peacocks on the fountain — generated as a 10s pull-BACK from the enriched still (kling3_0_turbo, start_image; kling3_0 end_image failed twice) then REVERSED and sped up 1.67× with ffmpeg (reverse,setpts,fps=30 — UNIFORM speed; an eased slow-down ending was tried and removed on owner request) so it ends exactly on the composition, compressed to 576×1024 CRF28 ≈ 820 KB; it plays ONCE from the open tap (no autoplay/loop in the intro; gesture play() + visibilitychange resume gated on opened) and freezes on its final frame, which reveal-scene.webp (extracted last frame) mirrors as the fallback/hero still; text fades in at ~4.8s as the camera settles, page reveals at ~9.5s; the scene video is ONE permanent `fixed inset-0` layer behind everything (intro overlay holds only envelope + texts; hero section is transparent over it; sections below the hero sit in a bg-ivory wrapper that covers it while scrolling) — after several "shot change"/jank complaints this proved to be the only reliable structure: never swap or crossfade the background layer at video end; reveal-scene.webp remains on disk as ASSETS.scene but is no longer rendered behind the video — the butterfly was removed entirely (butterfly.png kept on disk, unused); own assets in `public/assets/templates/floral-romantic/` (envelope-texture.webp, envelope-closed.webp, reveal-scene.mp4/.webp, butterfly.png, wax-seal.png, music.mp3, preview.svg); template default music is an ORIGINAL synthesized harp piece (music.mp3, 57.7s loop, D major I–V–vi–IV arpeggios at 68bpm, rendered sample-by-sample by a Node script — same pluck voice as the opening chime so the chime resolves straight into it; Satie's Gymnopédie was tried first and rejected by the owner) — used whenever data.music is empty OR equals the base config's `/music/wedding.mp3` (Islamic Royal chrome that must not leak); the opening chime (opening-chime.mp3) is a very soft D-major harp arpeggio synthesized with ffmpeg aevalsrc (first louder version rejected — keep amplitudes ≈0.13, limit 0.5, octave D4); the location card embeds Google Maps when googleMapsEmbedUrl is set, and the calendar button was replaced by a universal Save-the-Date .ics download (Apple Calendar on iPhone, Google Calendar on Android, floating local time + 1-day reminder); own fixed cream/wine/rose palette (ignores owner theme colors); FR/AR + RTL; same data model and rsvp_responses contract; intro text animations use direct animate targets only — variants propagation silently failed here, and exit-completion waits deadlock in background tabs; demo wedding WED-NP69XW)
- Supabase
- Vercel deployment

## Roadmap

1. Islamic Royal V2 polish
2. Luxury Gold (new template: registry entry + renderer, like Heritage)
3. Modern Minimal
4. QR Code
5. Analytics
6. Custom Domain
