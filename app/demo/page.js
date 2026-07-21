import InvitationApp from "@/components/InvitationApp";
import { getSeo } from "@/lib/config-adapter";

/* الدعوة التجريبية لقالب Islamic Royal — كانت على الجذر قبل أن
   يصبح الجذر هو موقع Dawati التسويقي. */

export const metadata = {
  title: getSeo().title,
  description: getSeo().description,
};

export default function IslamicRoyalDemo() {
  return <InvitationApp />;
}
