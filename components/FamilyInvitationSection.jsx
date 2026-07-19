"use client";

import Reveal from "./Reveal";
import { getDisplayText, toFormalName } from "./heritage/digitalInviteLuxuryDefaults";

/**
 * Family Invitation block — "تتشرف عائلة … بدعوتكم لحضور حفل زواج
 * ابننا/ابنتنا …". Rendered INSIDE the intro panel (روحان ومصير واحد
 * كتبه الله), replacing the generic couple message when the owner
 * filled the invitation fields (wizard step 5, texts.invitation.{ar,fr}).
 * Empty personal fields hide; date/time/venue fall back to the values
 * already saved in the standard dashboard fields. Display-time defaults
 * only — nothing is persisted.
 */
const ROYAL_INV_UI = {
  fr: {
    familyPrefix: "La famille",
    secondFamilyPrefix: "et la famille",
    // مفرد/جمع حسب عدد العائلات المذكورة
    invitationText: "a l’immense honneur de vous convier à la célébration du mariage",
    invitationTextPlural: "ont l’immense honneur de vous convier à la célébration du mariage",
    son: "de son fils",
    daughter: "de sa fille",
    sonPlural: "de leur fils",
    daughterPlural: "de leur fille",
    dateIntro: "qui sera célébré, si Dieu le veut,",
    hallIntro: "à la salle",
  },
  ar: {
    familyPrefix: "تتشرف عائلة",
    secondFamilyPrefix: "وعائلة",
    invitationText: "بدعوتكم لحضور حفل زواج",
    son: "ابننا",
    daughter: "ابنتنا",
    dateIntro: "وذلك بمشيئة الله تعالى يوم",
    hallIntro: "بقاعة",
  },
};

export default function FamilyInvitationBlock({ data }) {
  const saved = data.invitation;
  if (!saved) return null;

  const lang = data.lang === "ar" ? "ar" : "fr";
  const ui = ROYAL_INV_UI[lang];
  const font = lang === "ar" ? "font-arabicText" : "font-body";
  const italic = lang === "ar" ? "" : "italic";

  const fatherName = toFormalName(getDisplayText(saved.fatherName));
  const motherName = toFormalName(getDisplayText(saved.motherName));
  const bothFamilies = !!(fatherName && motherName);

  const inv = {
    fatherName,
    motherName,
    invitationText: getDisplayText(
      saved.invitationText,
      bothFamilies && ui.invitationTextPlural ? ui.invitationTextPlural : ui.invitationText
    ),
    mainTitle: getDisplayText(saved.mainTitle),
    honoreeName: getDisplayText(saved.brideName),
    dateIntro: getDisplayText(saved.dateIntro, ui.dateIntro),
    weddingDate: getDisplayText(saved.weddingDate, data.event.displayDate),
    time: getDisplayText(saved.time, data.event.displayTime),
    hallIntro: getDisplayText(saved.hallIntro, ui.hallIntro),
    hallName: getDisplayText(saved.hallName, data.location.venueName || ""),
    footerMessage: getDisplayText(saved.footerMessage),
  };
  const gendered =
    saved.honoreeGender === "male"
      ? (bothFamilies && ui.sonPlural) || ui.son
      : saved.honoreeGender === "female"
        ? (bothFamilies && ui.daughterPlural) || ui.daughter
        : "";

  // بلا اسم عائلة ولا نص مخصص لا معنى للكتلة — تبقى مخفية
  if (!inv.fatherName && !inv.motherName && !inv.honoreeName && !inv.mainTitle) return null;

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} className="text-center">
      {(inv.fatherName || inv.motherName) && (
        <Reveal>
          {/* القالب يؤطّر الاسم الخام: "تتشرف عائلة X" — المالك يكتب الاسم فقط */}
          {inv.fatherName && (
            <p className={`text-2xl leading-relaxed text-burgundy-dark ${font}`}>
              {ui.familyPrefix} {inv.fatherName}
            </p>
          )}
          {inv.motherName && (
            <p className={`mt-1 text-2xl leading-relaxed text-burgundy-dark ${font}`}>
              {ui.secondFamilyPrefix} {inv.motherName}
            </p>
          )}
        </Reveal>
      )}

      <Reveal delay={0.12}>
        <p className={`mt-5 text-lg leading-relaxed text-ink/80 ${font} ${italic}`}>
          {inv.invitationText}
          {gendered && ` ${gendered}`}
        </p>
      </Reveal>

      {inv.mainTitle && (
        <Reveal delay={0.18}>
          <p
            className={`mt-6 text-gold-dark ${
              lang === "ar" ? "font-arabicText text-4xl sm:text-5xl" : "font-monogram text-5xl sm:text-6xl"
            }`}
          >
            {inv.mainTitle}
          </p>
        </Reveal>
      )}

      {inv.honoreeName && (
        <Reveal delay={0.22}>
          <p
            className={`mt-5 leading-tight text-gold-dark ${
              lang === "ar"
                ? "font-arabicText text-[2.6rem] sm:text-[3.2rem]"
                : "font-monogram text-[3rem] sm:text-[3.6rem]"
            }`}
          >
            {inv.honoreeName}
          </p>
        </Reveal>
      )}

      {(inv.dateIntro || inv.weddingDate || inv.time) && (
        <Reveal delay={0.28}>
          {inv.dateIntro && (
            <p className={`mt-8 text-base text-ink/60 ${font} ${italic}`}>{inv.dateIntro}</p>
          )}
          {inv.weddingDate && (
            <p className={`mt-2 text-2xl font-medium text-ink ${font}`}>{inv.weddingDate}</p>
          )}
          {inv.time && <p className={`mt-1 text-lg text-ink/80 ${font}`}>{inv.time}</p>}
        </Reveal>
      )}

      {(inv.hallIntro || inv.hallName) && inv.hallName && (
        <Reveal delay={0.34}>
          <p className={`mt-7 text-base text-ink/60 ${font}`}>{inv.hallIntro}</p>
          <p
            dir="auto"
            className="mt-1 font-serif text-2xl font-medium tracking-[0.05em] text-gold-dark sm:text-3xl"
          >
            {inv.hallName}
          </p>
        </Reveal>
      )}

      {inv.footerMessage && (
        <Reveal delay={0.4}>
          <p className={`mt-8 text-base leading-relaxed text-ink/70 ${font} ${italic}`}>
            {inv.footerMessage}
          </p>
        </Reveal>
      )}
    </div>
  );
}
