"use client";

/**
 * نموذج الطلب المدمج في الصفحة الرئيسية — قسم «اطلبا دعوتكما الآن».
 * نسخة مختصرة من معالج /site/order في بطاقة واحدة (بدون خطوات):
 * الباقة + القالب (اختياري) + الاسمان + الهاتف ثم إرسال إلى /api/site/orders.
 * لا يمسّ صفحة /site/order — أزرار ?template= و ?pack= تبقى تعمل كما هي.
 */

import { useState } from "react";
import { CATALOG, PRICING, formatDZD, whatsappLink } from "./site-config";
import { Reveal, SectionHead, WhatsAppIcon } from "./ui";
import { useSiteWhatsApp } from "./useSiteWhatsApp";
import { trackOrderPurchase } from "./Pixels";

const LIVE_TEMPLATES = CATALOG.filter((c) => !c.comingSoon);
const DEFAULT_PACK = (PRICING.find((p) => p.highlight) || PRICING[0]).id;

export function HomeOrderSection({ lang, t }) {
  const arabic = lang === "ar";
  const font = arabic ? "font-arabicText" : "font-body";
  const o = t.order;

  const [packId, setPackId] = useState(DEFAULT_PACK);
  const [templateId, setTemplateId] = useState("");
  const [groom, setGroom] = useState("");
  const [bride, setBride] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("idle"); // idle | sending | done | error
  const [fieldError, setFieldError] = useState("");

  const pack = PRICING.find((p) => p.id === packId);
  const chosen = LIVE_TEMPLATES.find((c) => c.id === templateId);

  const validate = () => {
    if (groom.trim().length < 2) return o.errorGroom;
    if (bride.trim().length < 2) return o.errorBride;
    const digits = phone.replace(/\D/g, "");
    if (!/^0[567]\d{8}$/.test(digits)) return o.errorPhone;
    if (!packId) return o.errorPack;
    return "";
  };

  const submit = async () => {
    const err = validate();
    if (err) return setFieldError(err);
    setFieldError("");
    setState("sending");
    try {
      const res = await fetch("/api/site/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groomName: groom.trim(),
          brideName: bride.trim(),
          weddingDate: "",
          venue: "",
          phone: phone.trim(),
          templateId,
          packId,
          lang,
        }),
      });
      setState(res.ok ? "done" : "error");
      if (res.ok) {
        trackOrderPurchase({ templateId, packId, value: pack ? pack.price : 0 });
      }
    } catch {
      setState("error");
    }
  };

  const waSummary = [
    arabic
      ? "السلام عليكم، أرسلت طلبًا من الموقع 🌹"
      : "Bonjour, j'ai envoyé une demande depuis le site 🌹",
    `${o.groom}: ${groom.trim()}`,
    `${o.bride}: ${bride.trim()}`,
    `${o.phone}: ${phone.trim()}`,
    chosen ? `${o.templateLabel}: ${chosen.name}` : null,
    pack ? `${o.packLabel}: ${pack.name[lang]} (${formatDZD(pack.price, lang)})` : null,
  ]
    .filter(Boolean)
    .join("\n");
  const waNumber = useSiteWhatsApp();
  const wa = whatsappLink(waSummary, waNumber);

  const inputCls = `w-full rounded-2xl border border-gold/30 bg-ivory px-5 py-3.5 text-base text-ink shadow-sm outline-none transition-colors placeholder:text-ink/30 focus:border-gold ${font}`;
  const labelCls = `mb-2 block text-sm font-semibold text-ink/75 ${font}`;
  const chipBase = `rounded-2xl border px-4 py-2.5 text-sm transition-colors ${font}`;

  return (
    <section id="commander" className="px-5 py-20 sm:px-8 sm:py-24 bg-ivory-light/60">
      <SectionHead
        lang={lang}
        kicker={o.kicker}
        title={o.title}
        subtitle={o.subtitle}
      />

      <Reveal className="mx-auto mt-12 max-w-3xl">
        <div className="rounded-3xl border border-gold/25 bg-cream p-6 shadow-card sm:p-9">
          {state === "done" ? (
            <div className="py-6 text-center">
              <span className="text-5xl">🎉</span>
              <h3
                className={`mt-4 text-2xl font-bold text-burgundy-dark ${
                  arabic ? "font-arabicText" : "font-serif"
                }`}
              >
                {o.successTitle}
              </h3>
              <p className={`mx-auto mt-3 max-w-md text-ink/65 ${font}`}>
                {o.successText}
              </p>
              {wa ? (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-6 inline-flex items-center gap-2.5 rounded-2xl bg-[#25D366] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 ${font}`}
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  {o.continueWhatsApp}
                </a>
              ) : null}
            </div>
          ) : (
            <div className="space-y-7">
              {/* الباقة */}
              <div>
                <span className={labelCls}>{o.packLabel}</span>
                <div className="flex flex-wrap gap-2.5">
                  {PRICING.map((p) => {
                    const active = packId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPackId(p.id)}
                        className={`${chipBase} ${
                          active
                            ? "border-burgundy bg-burgundy text-cream shadow"
                            : "border-gold/40 bg-ivory text-ink/70 hover:border-burgundy/50"
                        }`}
                      >
                        {p.highlight ? "⭐ " : ""}
                        {p.name[lang]}
                        <span
                          className={`ms-2 font-bold tabular-nums ${
                            active ? "text-gold-light" : "text-burgundy-dark"
                          }`}
                        >
                          {formatDZD(p.price, lang)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* القالب — اختياري */}
              <div>
                <span className={labelCls}>
                  {o.templateLabel}{" "}
                  <span className="font-normal text-ink/40">({o.optional})</span>
                </span>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => setTemplateId("")}
                    className={`${chipBase} ${
                      templateId === ""
                        ? "border-burgundy bg-burgundy text-cream shadow"
                        : "border-gold/40 bg-ivory text-ink/70 hover:border-burgundy/50"
                    }`}
                  >
                    {o.templateLater}
                  </button>
                  {LIVE_TEMPLATES.map((c) => {
                    const active = templateId === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setTemplateId(c.id)}
                        className={`${chipBase} ${
                          active
                            ? "border-burgundy bg-burgundy text-cream shadow"
                            : "border-gold/40 bg-ivory text-ink/70 hover:border-burgundy/50"
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* الاسمان والهاتف */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>{o.groom} *</label>
                  <input
                    type="text"
                    value={groom}
                    onChange={(e) => setGroom(e.target.value)}
                    placeholder={o.groomPh}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>{o.bride} *</label>
                  <input
                    type="text"
                    value={bride}
                    onChange={(e) => setBride(e.target.value)}
                    placeholder={o.bridePh}
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>{o.phone} *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={o.phonePh}
                  className={inputCls}
                  dir="ltr"
                />
              </div>

              {fieldError ? (
                <p className={`text-sm font-semibold text-red-600 ${font}`}>
                  {fieldError}
                </p>
              ) : null}
              {state === "error" ? (
                <p className={`text-sm font-semibold text-red-600 ${font}`}>
                  {o.errorGeneric}
                </p>
              ) : null}

              <button
                type="button"
                onClick={submit}
                disabled={state === "sending"}
                className={`w-full rounded-2xl bg-gradient-to-r from-burgundy to-burgundy-dark px-8 py-4 text-base font-bold text-cream shadow-royal transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60 ${font}`}
              >
                {state === "sending" ? o.sending : o.submit}
              </button>
            </div>
          )}
        </div>
      </Reveal>
    </section>
  );
}
