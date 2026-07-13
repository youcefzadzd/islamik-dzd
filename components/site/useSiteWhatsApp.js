"use client";

/**
 * رقم واتساب الموقع — يُقرأ من /api/site/settings (قاعدة البيانات،
 * قابل للتعديل من لوحة التحكم ← Paramètres) مع site-config كاحتياط.
 * يُخزَّن مؤقتًا على مستوى الوحدة فلا يُطلب أكثر من مرة في الزيارة.
 */

import { useEffect, useState } from "react";
import { SITE } from "./site-config";

let cached = null; // null = لم يُجلب بعد

export function useSiteWhatsApp() {
  const [num, setNum] = useState(cached ?? SITE.whatsappNumber);

  useEffect(() => {
    if (cached !== null) {
      setNum(cached);
      return;
    }
    let alive = true;
    fetch("/api/site/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        cached = (j && j.whatsappNumber) || SITE.whatsappNumber || "";
        if (alive) setNum(cached);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return num;
}
