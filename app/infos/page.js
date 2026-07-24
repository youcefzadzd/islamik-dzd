import WeddingInfoForm from "@/components/site/WeddingInfoForm";
import { SITE } from "@/components/site/site-config";

/* استمارة معلومات العرس — يرسل النشاط هذا الرابط للعميل بعد الاتفاق،
   والعميل يملؤها فتصل التفاصيل كاملة على واتساب برسالة منسّقة */

export const metadata = {
  title: `${SITE.brandName} — استمارة معلومات العرس | Fiche mariage`,
  description:
    "املآ معلومات عرسكما لنجهّز دعوتكما الرقمية — تصلنا مباشرة على واتساب.",
};

export default function InfosPage() {
  return <WeddingInfoForm />;
}
