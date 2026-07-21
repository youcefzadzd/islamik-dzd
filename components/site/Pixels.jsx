"use client";

/**
 * Facebook (Meta) Pixel + TikTok Pixel لموقع التسويق فقط.
 *
 * المعرّفات تُدار من لوحة التحكم ← Paramètres ← Pixels publicitaires
 * (عدة معرّفات لكل منصة — كل بيكسل يستقبل نفس الأحداث)، وتُجلب من
 * /api/site/settings. متغيرا البيئة يبقيان احتياطًا اختياريًا:
 *   NEXT_PUBLIC_FACEBOOK_PIXEL_ID / NEXT_PUBLIC_TIKTOK_PIXEL_ID
 * لا يُحقن أي سكربت ما دامت القوائم فارغة.
 *
 * الأحداث: PageView تلقائيًا، ومبيعة (Purchase / CompletePayment)
 * عبر trackOrderPurchase() عند نجاح إرسال نموذج الطلب.
 */

import { useEffect } from "react";

const ENV_FB = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || "";
const ENV_TT = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || "";

let fetched = false; // لا نجلب الإعدادات إلا مرة واحدة في الزيارة
const loadedFb = new Set();
const loadedTt = new Set();

function ensureFbBase() {
  if (window.fbq) return;
  /* السكربت الرسمي لـ Meta Pixel */
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
}

function ensureTtBase() {
  if (window.ttq) return;
  /* السكربت الرسمي لـ TikTok Pixel — ttq.load يُستدعى لكل معرّف */
  !(function (w, d, t) {
    w.TiktokAnalyticsObject = t;
    var ttq = (w[t] = w[t] || []);
    ttq.methods = [
      "page", "track", "identify", "instances", "debug", "on", "off",
      "once", "ready", "alias", "group", "enableCookie", "disableCookie",
    ];
    ttq.setAndDefer = function (t, e) {
      t[e] = function () {
        t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
      };
    };
    for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
    ttq.instance = function (t) {
      var e = ttq._i[t] || [];
      for (var n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
      return e;
    };
    ttq.load = function (e, n) {
      var i = "https://analytics.tiktok.com/i18n/pixel/events.js";
      ttq._i = ttq._i || {};
      ttq._i[e] = [];
      ttq._i[e]._u = i;
      ttq._t = ttq._t || {};
      ttq._t[e] = +new Date();
      ttq._o = ttq._o || {};
      ttq._o[e] = n || {};
      var o = document.createElement("script");
      o.type = "text/javascript";
      o.async = true;
      o.src = i + "?sdkid=" + e + "&lib=" + t;
      var a = document.getElementsByTagName("script")[0];
      a.parentNode.insertBefore(o, a);
    };
  })(window, document, "ttq");
}

/** يحمّل ويُهيّئ كل المعرّفات المُمرّرة (تُهيّأ كل واحدة مرة واحدة فقط) */
function activatePixels({ facebook = [], tiktok = [] }) {
  for (const id of facebook) {
    if (loadedFb.has(id)) continue;
    loadedFb.add(id);
    ensureFbBase();
    window.fbq("init", id);
  }
  if (facebook.some((id) => loadedFb.has(id)) && window.fbq && !window.__dzFbPv) {
    window.__dzFbPv = true;
    window.fbq("track", "PageView");
  }
  for (const id of tiktok) {
    if (loadedTt.has(id)) continue;
    loadedTt.add(id);
    ensureTtBase();
    window.ttq.load(id);
  }
  if (tiktok.some((id) => loadedTt.has(id)) && window.ttq && !window.__dzTtPv) {
    window.__dzTtPv = true;
    window.ttq.page();
  }
}

/**
 * مبيعة "طلب مُرسل" — تصل إلى كل البيكسلات المفعّلة في المنصتين.
 * حملات الشراء: Meta يتعرّف على "Purchase" وتيك توك على
 * "CompletePayment" — كلاهما بقيمة الباقة بالدينار حتى تُحسب
 * كمبيعة ويتحسّن الاستهداف على المشترين الفعليين.
 */
export function trackOrderPurchase({ templateId, packId, value } = {}) {
  try {
    if (window.fbq) {
      window.fbq("track", "Purchase", {
        content_name: templateId || "order",
        content_category: packId || "",
        content_type: "product",
        value: value || 0,
        currency: "DZD",
      });
    }
    if (window.ttq) {
      window.ttq.track("CompletePayment", {
        content_name: templateId || "order",
        content_type: "product",
        value: value || 0,
        currency: "DZD",
      });
    }
  } catch {
    /* التتبع لا يكسر النموذج أبدًا */
  }
}

export default function Pixels() {
  useEffect(() => {
    /* احتياط البيئة يعمل فورًا حتى قبل رد الإعدادات */
    activatePixels({
      facebook: ENV_FB ? [ENV_FB] : [],
      tiktok: ENV_TT ? [ENV_TT] : [],
    });
    if (fetched) return;
    fetched = true;
    fetch("/api/site/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j && j.pixels) activatePixels(j.pixels);
      })
      .catch(() => {});
  }, []);
  return null;
}
