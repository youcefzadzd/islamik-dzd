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
- Supabase
- Vercel deployment

## Roadmap

1. Islamic Royal V2 polish
2. Luxury Gold (new template: registry entry + renderer, like Heritage)
3. Floral Romantic
4. Modern Minimal
5. QR Code
6. Analytics
7. Custom Domain
