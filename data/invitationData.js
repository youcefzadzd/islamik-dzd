/**
 * ============================================================
 *  INVITATION CONFIG — الملف الوحيد الذي تحتاج تعديله.
 *  Islamic Royal — دعوة زفاف إسلامية فاخرة باللغة الفرنسية.
 *  كل صفحة وكل قسم في الموقع يقرأ محتواه من هذا الملف فقط.
 * ============================================================
 */

const invitationData = {
  // عنوان المتصفح والمعاينة عند مشاركة الرابط
  seo: {
    title: "Mariage de Youcef & Katia",
    description: "Invitation à notre mariage — avec la grâce d'Allah.",
  },

  // ===================== الآية القرآنية =====================
  ayah: {
    text:
      "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا " +
      "لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً",
    reference: "سورة الروم - الآية 21",
  },

  // ===================== العروسان =====================
  couple: {
    // الاسم بخط عربي فاخر + الاسم الفرنسي يظهر أسفله
    groomNameAr: "يوسف",
    groomNameFr: "Youcef",
    brideNameAr: "كاتيا",
    brideNameFr: "Katia",
    // ترتيب الظهور: ["groom", "bride"] أو ["bride", "groom"]
    order: ["groom", "bride"],
  },

  // ===================== نص الدعوة بالفرنسية =====================
  invitationMessage: {
    lines: [
      "Nous avons l'immense joie de vous inviter à célébrer notre mariage.",
      "Votre présence sera pour nous un immense honneur.",
    ],
  },

  // ===================== التاريخ والوقت =====================
  event: {
    // التاريخ والوقت الدقيق المستخدم لحساب العد التنازلي (لا تغيّر الصيغة)
    dateTimeISO: "2026-08-14T16:00:00",
    displayDate: "14 Août 2026", // التاريخ كما يظهر في الصفحة
    displayDay: "Vendredi", // اسم اليوم بالفرنسية
    displayTime: "16h00", // الوقت كما يظهر في الصفحة
  },

  // ===================== المكان =====================
  location: {
    venueName: "AB Parke", // اسم القاعة
    address: "Bouira, Algérie", // العنوان
    // رابط جوجل ماب يُستخدم لزر "Voir sur Google Maps"
    mapLinkUrl: "https://maps.app.goo.gl/PFApV3L7r9zXFtfQ9",
    buttonText: "Voir sur Google Maps",
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
    submitText: "Confirmer ma présence",
    submittingText: "Envoi en cours...",
    // اتركها فارغة لتخزين الردود في متصفح الضيف فقط، أو ضع رابط API خاص بك
    submitEndpoint: "",
    confirmationMessage: "Qu'Allah bénisse votre présence. Merci pour votre réponse.",
  },

  // ===================== الدعاء الختامي =====================
  dua: {
    text: "بارك الله لهما وبارك عليهما وجمع بينهما في خير",
  },

  // ===================== التوقيع =====================
  signature: {
    groomFamilyLabel: "Famille du marié",
    brideFamilyLabel: "Famille de la mariée",
  },

  // ===================== ألوان القالب =====================
  // غيّر أي كود لون (hex) هنا وسيتغيّر لون الموقع كاملاً تلقائيًا —
  // بدون الحاجة لتعديل أي ملف تصميم أو كود.
  theme: {
    colors: {
      white: "#FFFFFF", // أبيض
      ivory: "#FAF6EC", // عاجي (خلفية أساسية)
      ivoryLight: "#FFFDF8", // عاجي فاتح جدًا
      ivoryDark: "#F0E8D6", // عاجي غامق (خلفيات أقسام)
      gold: "#C9A227", // الذهبي الأساسي (نصوص وحدود وزخارف)
      goldLight: "#E4C866", // ذهبي فاتح
      goldDark: "#9C7A1B", // ذهبي غامق
      emerald: "#0B5E42", // الأخضر الزمردي الأساسي (عناوين وأزرار)
      emeraldLight: "#146B4E", // زمردي فاتح
      emeraldDark: "#073D2B", // زمردي غامق
      ink: "#20281F", // لون النص الأساسي
      burgundy: "#6E1F2B", // لون ختم الشمع (Wax Seal) فقط
      burgundyLight: "#8C2E3C", // عنابي فاتح (لمعان الختم)
      burgundyDark: "#4A1420", // عنابي غامق (ظل الختم)
    },
  },
};

export default invitationData;
