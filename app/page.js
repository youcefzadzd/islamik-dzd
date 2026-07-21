import SiteHome from "@/components/site/SiteHome";
import { SITE } from "@/components/site/site-config";

/* www.dawati-dz.com — الجذر هو موقع Dawati التسويقي.
   الدعوة التجريبية لقالب Islamic Royal انتقلت إلى /demo. */

export const metadata = {
  title: `${SITE.brandName} — ${SITE.tagline.ar} | ${SITE.tagline.fr}`,
  description:
    "دعوات زفاف رقمية فاخرة بالعربية والفرنسية: ظرف يُفتح بختم شمع، موسيقى، تأكيد حضور RSVP ولوحة متابعة الضيوف. Invitations de mariage digitales de luxe avec RSVP.",
};

export default function Home() {
  return <SiteHome />;
}
