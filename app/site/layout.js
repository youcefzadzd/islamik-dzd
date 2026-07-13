import { SITE } from "@/components/site/site-config";

export const metadata = {
  title: `${SITE.brandName} — ${SITE.tagline.ar} | ${SITE.tagline.fr}`,
  description:
    "دعوات زفاف رقمية فاخرة بالعربية والفرنسية: ظرف يُفتح بختم شمع، موسيقى، تأكيد حضور RSVP ولوحة متابعة الضيوف. Invitations de mariage digitales de luxe avec RSVP.",
};

export default function SiteLayout({ children }) {
  return children;
}
