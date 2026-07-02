# Islamic Royal — Wedding Invitation Template

A luxurious, mobile-first Islamic wedding invitation in French, built with
Next.js (App Router), Tailwind CSS, Framer Motion and GSAP. White / ivory /
gold / emerald palette, a tap-to-open envelope, a Qur'anic ayah, Arabic
calligraphy names, a French message, countdown, RSVP, a closing dua, and a
family signature — all decorated with pure SVG/CSS Islamic geometric
motifs (no images from the internet, none required).

This is a fully independent project — it does not share any code with
`luxury-invite-template` and editing one never affects the other.

## Customize everything from one file

Open [`data/invitationData.js`](data/invitationData.js) and edit the values.
Every section reads from this file only:

| Want to change...            | Field in `invitationData.js`                       |
| ------------------------------ | ---------------------------------------------------- |
| Bismillah text on the opening screen | `opening.bismillah`                              |
| Qur'anic verse & reference       | `ayah.text`, `ayah.reference`                      |
| Groom's name (Arabic + French)     | `couple.groomNameAr`, `couple.groomNameFr`         |
| Bride's name (Arabic + French)      | `couple.brideNameAr`, `couple.brideNameFr`         |
| French invitation message         | `invitationMessage.lines` (array, one per paragraph) |
| Wedding date & time (countdown)    | `event.dateTimeISO` (exact format, drives the timer) |
| Date/time as displayed             | `event.displayDate`, `event.displayDay`, `event.displayTime` |
| Venue name & address                | `location.venueName`, `location.address`          |
| Google Maps button link             | `location.mapLinkUrl`                              |
| RSVP text, labels & deadline         | `rsvp` (every label is in French and editable here) |
| Closing dua                          | `dua.text`                                          |
| Family signature lines                | `signature.groomFamilyLabel`, `signature.brideFamilyLabel` |
| Template colors (whole site)          | `theme.colors` — every hex code in this block       |

Every field has an Arabic comment above it in the file explaining what it
controls.

### How the color system works

`theme.colors` holds every hex code used across the site (`white`, `ivory`,
`gold`, `emerald`, `ink`, each with light/dark variants where relevant).
These convert into CSS variables at build time (`lib/theme.js` +
`app/layout.js`), and every component — the envelope's emblem seal, the
countdown boxes, the RSVP button — reads its color from those variables.
Change a hex code in `theme.colors` and the whole site recolors itself; no
component file or Tailwind config needs to be touched.

## Decorations are code, not images

Every ornament (the 8-point star emblem, the corner flourishes, the subtle
background star pattern) lives in `components/ornaments/` as plain SVG/CSS
— nothing is fetched from the internet. Feel free to open those files and
adjust stroke widths, sizes or opacity; they're small and self-contained.

## Fonts

- **Amiri** — the Qur'anic ayah and closing dua (`font-arabicText`).
- **Aref Ruqaa** — the bride/groom names in Arabic calligraphy (`font-arabicDisplay`).
- **Playfair Display** — French headings/dates (`font-serif`).
- **Cormorant Garamond** — French body text (`font-body`).

All are loaded via `next/font/google` in `app/layout.js`.

## RSVP responses

By default, RSVP submissions are saved to the browser's `localStorage`
(key `rsvps`). To collect them centrally, set `rsvp.submitEndpoint` in the
config to any URL that accepts a JSON POST body
(`{ name, attending, guests, message }`).

## Run locally

```bash
npm install
npm run dev
```

Visit http://localhost:3000.
