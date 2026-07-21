"use client";

/**
 * Facebook (Meta) Pixel + TikTok Pixel لموقع التسويق فقط.
 *
 * المعرّفات تُقرأ من متغيرات البيئة في Vercel — لا يُحقن أي سكربت
 * ما دام المعرّف فارغًا، فالمكوّن آمن قبل ضبطها:
 *   NEXT_PUBLIC_FACEBOOK_PIXEL_ID  (مثال: 1234567890)
 *   NEXT_PUBLIC_TIKTOK_PIXEL_ID    (مثال: ABCDEF123456)
 *
 * الأحداث: PageView تلقائيًا عند التحميل، وتحويل "طلب" عبر
 * trackOrderLead() عند نجاح إرسال نموذج الطلب.
 */

import { useEffect } from "react";

const FB_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || "";
const TT_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || "";

function loadFacebook() {
  if (!FB_ID || window.__dzFbPixel) return;
  window.__dzFbPixel = true;
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
  window.fbq("init", FB_ID);
  window.fbq("track", "PageView");
}

function loadTikTok() {
  if (!TT_ID || window.__dzTtPixel) return;
  window.__dzTtPixel = true;
  /* السكربت الرسمي لـ TikTok Pixel */
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
    ttq.load(TT_ID);
    ttq.page();
  })(window, document, "ttq");
}

/** تحويل "طلب جديد" — يُستدعى بعد نجاح إرسال نموذج الطلب */
export function trackOrderLead({ templateId, packId, value } = {}) {
  try {
    if (window.fbq) {
      window.fbq("track", "Lead", {
        content_name: templateId || "order",
        content_category: packId || "",
        value: value || 0,
        currency: "DZD",
      });
    }
    if (window.ttq) {
      window.ttq.track("SubmitForm", {
        content_name: templateId || "order",
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
    loadFacebook();
    loadTikTok();
  }, []);
  return null;
}
