/**
 * Template registry — single source of truth for the invitation designs
 * the platform offers. The chosen template id travels inside the
 * wedding's `theme` jsonb (theme.template), same trick as texts._archived:
 * no schema migration, and rows saved before this feature keep rendering
 * Islamic Royal exactly as before.
 *
 * Adding a template later = one entry here (status "live") + one renderer
 * in app/w/[weddingId]/page.js. Nothing else changes.
 */

export const DEFAULT_TEMPLATE_ID = "islamic-royal";

export const TEMPLATES = [
  {
    id: "islamic-royal",
    name: "Islamic Royal",
    version: "2.0",
    status: "live",
    preview: "/assets/hero-background.webp",
    demoUrl: "/",
    description:
      "Enveloppe scellée, cygnes animés, panneaux de papier artisanal, or et bordeaux — bilingue FR/AR avec RSVP.",
  },
  {
    id: "heritage",
    name: "Sage Garden",
    version: "1.0",
    status: "live",
    preview: "/assets/site/heritage-envelope.webp",
    description:
      "Jardin vintage : enveloppe sauge au sceau de cire terracotta, typographie calligraphiée, sections crème et rose poudré — bilingue FR/AR avec RSVP.",
  },
  { id: "luxury-gold", name: "Luxury Gold", status: "soon" },
  {
    id: "floral-romantic",
    name: "Floral Romantic",
    version: "1.0",
    status: "live",
    preview: "/assets/templates/floral-romantic/envelope-closed.webp",
    description:
      "Enveloppe bordeaux gaufrée de roses au sceau de cire doré, qui s'ouvre sur un voyage cinématique — jardin classique, paons dorés, harpe douce — bilingue FR/AR avec RSVP.",
  },
  { id: "modern-minimal", name: "Modern Minimal", status: "soon" },
];

export function getTemplate(id) {
  return TEMPLATES.find((t) => t.id === id) || null;
}

/** unknown / not-yet-live ids fall back to the default template */
export function normalizeTemplateId(id) {
  const t = getTemplate(id);
  return t && t.status === "live" ? t.id : DEFAULT_TEMPLATE_ID;
}

/** which template a weddings row should render with */
export function templateIdFromRow(row) {
  return normalizeTemplateId(row?.theme?.template);
}
