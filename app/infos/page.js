import { Suspense } from "react";
import WeddingInfoForm from "@/components/site/WeddingInfoForm";
import { SITE } from "@/components/site/site-config";

/* استمارة معلومات العرس — يرسل النشاط هذا الرابط للعميل بعد الاتفاق
   (يفضَّل بصيغة /infos?order=<id> من بطاقة الطلب فتلتصق الاستمارة
   بالطلب مباشرة)، والتفاصيل تظهر داخل لوحة التحكم ← Commandes */

export const metadata = {
  title: `${SITE.brandName} — استمارة معلومات العرس | Fiche mariage`,
  description:
    "املآ معلومات عرسكما لنجهّز دعوتكما الرقمية — تصل مباشرة إلى فريق Dawati.",
};

export default function InfosPage() {
  return (
    <Suspense fallback={null}>
      <WeddingInfoForm />
    </Suspense>
  );
}
