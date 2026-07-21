"use client";

/**
 * زر واتساب عائم — يبقى ثابتًا في زاوية الشاشة أثناء التمرير على
 * كل صفحات موقع التسويق. الرقم من لوحة التحكم (useSiteWhatsApp)؛
 * لا يظهر الزر إطلاقًا إن لم يُضبط رقم. النقر يسجَّل كحدث Contact
 * في البيكسلات المفعّلة (جمهور "تواصل معنا" مفيد لإعادة الاستهداف).
 */

import { motion } from "framer-motion";
import { whatsappLink } from "./site-config";
import { WhatsAppIcon } from "./ui";
import { useSiteWhatsApp } from "./useSiteWhatsApp";

export default function WhatsAppFab({ lang = "ar" }) {
  const number = useSiteWhatsApp();
  const message =
    lang === "ar"
      ? "السلام عليكم، أريد الاستفسار عن دعوة زفاف رقمية 🌹"
      : "Bonjour, je souhaite me renseigner sur une invitation digitale 🌹";
  const href = whatsappLink(message, number);
  if (!href) return null;

  const track = () => {
    try {
      if (window.fbq) window.fbq("track", "Contact");
      if (window.ttq) window.ttq.track("Contact");
    } catch {}
  };

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={track}
      aria-label="WhatsApp"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.08, y: -2 }}
      className="fixed bottom-5 end-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgb(37_211_102/0.65)] transition-shadow hover:shadow-[0_14px_36px_-8px_rgb(37_211_102/0.8)]"
    >
      {/* نبضة خضراء هادئة خلف الزر */}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/40 [animation-duration:2.5s]"
      />
      <WhatsAppIcon className="h-7 w-7" />
    </motion.a>
  );
}
