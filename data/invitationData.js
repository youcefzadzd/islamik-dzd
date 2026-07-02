/**
 * ============================================================
 *  INVITATION CONFIG — الملف الوحيد الذي تحتاج تعديله.
 *  Islamic Royal — دعوة زفاف إسلامية فاخرة.
 *  كل نص، تاريخ، رابط أو صورة في الموقع يُقرأ من هذا الملف فقط.
 * ============================================================
 */

const invitationData = {
  // عنوان المتصفح والمعاينة عند مشاركة الرابط
  seo: {
    title: "Mariage de Youcef & Katia",
    description: "Invitation à notre mariage — avec la grâce d'Allah.",
  },

  // ===================== العروسان =====================
  couple: {
    // الحرف الأول من كل اسم يظهر تلقائيًا على ختم الشمع (Y & K)
    groomName: "Youcef",
    brideName: "Katia",
    groomNameAr: "يوسف",
    brideNameAr: "كاتيا",
  },

  // ===================== المغلف (شاشة الافتتاح) =====================
  envelope: {
    tapToOpenText: "Touchez pour ouvrir",
  },

  // ===================== الواجهة الرئيسية (Hero) =====================
  hero: {
    bismillah: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    eyebrow: "Wedding Day",
    scrollHintText: "Scroll down",
  },

  // ===================== التاريخ والوقت =====================
  event: {
    // التاريخ والوقت الدقيق المستخدم لحساب العد التنازلي (لا تغيّر الصيغة)
    dateTimeISO: "2026-08-14T16:00:00",
    displayDate: "14 Août 2026", // التاريخ كما يظهر في الصفحة
    displayDateShort: "14.08.26", // التاريخ المختصر أسفل "Wedding Day"
    displayDay: "Vendredi", // اسم اليوم
    displayTime: "16h00", // الوقت كما يظهر في الصفحة
  },

  // ===================== رسالة الافتتاح =====================
  intro: {
    // السطور المزخرفة بالخط الذهبي
    calligraphyLines: ["Deux âmes", "Un seul destin", "Écrit par Allah"],
    // نص الدعوة
    messageLines: [
      "Chers familles et amis,",
      "Nous avons l'immense joie de vous inviter à célébrer notre mariage.",
      "Votre présence illuminera le début de notre éternité.",
    ],
    // الآية القرآنية
    ayah: {
      text:
        "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا " +
        "لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً",
      reference: "سورة الروم — الآية 21",
    },
  },

  // ===================== العد التنازلي =====================
  countdown: {
    heading: "Compte à rebours",
    subtitleAr: "بقي على موعد الزفاف", // العنوان الفرعي بالعربية
    labels: { days: "Jours", hours: "Heures", minutes: "Minutes", seconds: "Secondes" },
    expiredText: "C'est le grand jour !",
  },

  // ===================== برنامج اليوم =====================
  schedule: {
    heading: "Programme de la journée",
    items: [
      { time: "16h00", title: "Accueil des invités" },
      { time: "17h00", title: "Cérémonie & Fatiha" },
      { time: "19h00", title: "Dîner" },
      { time: "21h00", title: "Gâteau & Célébration" },
      { time: "23h00", title: "Clôture de la soirée" },
    ],
  },

  // ===================== المكان =====================
  location: {
    heading: "Localisation",
    venueName: "AB Parke",
    address: "Bouira, Algérie",
    // رابط جوجل ماب يُستخدم لزر "Voir sur Google Maps"
    mapLinkUrl: "https://maps.app.goo.gl/PFApV3L7r9zXFtfQ9",
    // رابط الخريطة المدمجة (iframe) — اتركه فارغًا لإخفاء الخريطة
    mapEmbedUrl: "https://www.google.com/maps/embed?origin=mfe&pb=!1m2!2m1!1sAB%20Parke%20Bouira%20Alg%C3%A9rie",
    buttonText: "Voir sur Google Maps",
  },

  // ===================== الفيديو =====================
  video: {
    heading: "Notre vidéo",
    subheading: "Un avant-goût de notre grand jour",
    // ضع هنا رابط YouTube "embed" مثل: https://www.youtube-nocookie.com/embed/XXXXXXX
    // اتركه فارغًا لعرض إطار أنيق بدل الفيديو
    embedUrl: "",
    placeholderText: "La vidéo arrive bientôt…",
  },

  // ===================== معرض الصور =====================
  gallery: {
    heading: "Galerie",
    subheading: "Quelques instants de notre histoire",
    // أضف أو احذف الصور بحرية — ضع صورك في public/assets/
    images: [
      { src: "/assets/hero-background.webp", alt: "Arche royale aux cygnes" },
      { src: "/assets/thankyou-background.webp", alt: "Jardin des arches dorées" },
      { src: "/assets/envelope-first1.png", alt: "L'enveloppe scellée" },
    ],
  },

  // ===================== نموذج تأكيد الحضور (RSVP) =====================
  rsvp: {
    heading: "Confirmez votre présence",
    subheading: "Merci de nous répondre avant la date limite.",
    deadline: "Avant le 1er Août 2026",
    nameLabel: "Nom complet",
    namePlaceholder: "Votre nom",
    attendingLabel: "Serez-vous des nôtres ?",
    attendingYes: "Avec joie",
    attendingNo: "Avec regret",
    guestsLabel: "Nombre d'invités",
    messageLabel: "Message (optionnel)",
    messagePlaceholder: "Un mot pour les mariés",
    sealButtonText: "RSVP", // النص فوق ختم الشمع
    sealButtonHint: "Appuyez sur le sceau pour confirmer",
    submittingText: "Envoi en cours...",
    // اتركها فارغة لتخزين الردود في متصفح الضيف فقط، أو ضع رابط API خاص بك
    submitEndpoint: "",
    confirmationMessage: "Qu'Allah bénisse votre présence. Merci pour votre réponse.",
  },

  // ===================== رسالة الشكر الختامية =====================
  thankYou: {
    heading: "Au plaisir de vous voir !",
    message: "Votre présence est le plus beau des cadeaux.",
    dua: "بارك الله لهما وبارك عليهما وجمع بينهما في خير",
    signatureNames: "Youcef & Katia",
  },

  // ===================== الصور والأصول =====================
  assets: {
    // شاشة الافتتاح — المغلف الجديد (envelope-first1.png بعد المعالجة)
    envelopeClosed: "/assets/envelope-first1-open.webp",
    envelopeSeal: "/assets/envelope-first1-seal.webp",
    waxSeal: "/assets/wax-seal.webp",
    invitationPaper: "/assets/invitation-paper.webp",
    heroBackground: "/assets/hero-background.webp",
    countdownCard: "/assets/countdown-card.webp",
    thankYouBackground: "/assets/thankyou-background.webp",
  },

  // ===================== ألوان القالب =====================
  // غيّر أي كود لون (hex) هنا وسيتغيّر لون الموقع كاملاً تلقائيًا.
  // نظام التصميم الموحد — Luxury Islamic Wedding Collection
  theme: {
    colors: {
      white: "#FFFFFF", // أبيض
      ivory: "#F8F3EA", // عاجي دافئ (خلفية أساسية)
      ivoryLight: "#FDFAF3", // عاجي فاتح (خلفية البطاقات)
      ivoryDark: "#EFE4D6", // بيج فاتح (خلفيات أقسام متناوبة)
      gold: "#C6A15B", // الذهبي الأساسي (عناوين وحدود وزخارف)
      goldLight: "#D8BD7A", // ذهبي ناعم
      goldDark: "#A6813F", // ذهبي غامق (نصوص ذهبية على الفاتح)
      emerald: "#7B1E2B", // مرادف العنابي (متوافق مع الظلال القديمة)
      emeraldLight: "#96323F",
      emeraldDark: "#521219",
      ink: "#5A4636", // بني النصوص
      burgundy: "#7B1E2B", // العنابي (ختم الشمع والأزرار)
      burgundyLight: "#96323F", // عنابي فاتح
      burgundyDark: "#521219", // عنابي غامق
    },
  },
};

export default invitationData;
