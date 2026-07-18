/**
 * إعدادات موقع العرض والبيع — عدّل كل شيء من هنا.
 * هذا الملف هو المصدر الوحيد لبيانات الموقع التسويقي (/site):
 * الهوية، واتساب، القوالب المعروضة، الأسعار، المقارنة، التقييمات، الأسئلة.
 *
 * لا يمسّ هذا الملف أي جزء من منصة الدعوات (dashboard / RSVP / القوالب).
 */

export const SITE = {
  brandName: "Dawati",
  brandNameAr: "دعوتي",
  tagline: {
    ar: "دعوات زفاف رقمية فاخرة",
    fr: "Invitations de mariage digitales de luxe",
  },
  // ضع رقم واتساب بصيغة دولية بدون + (مثال: 213550123456).
  // ما دام الرقم يحتوي X فأزرار الطلب تمرّر الزائر إلى قسم التواصل بدلًا من واتساب.
  whatsappNumber: "213XXXXXXXXX",
  email: "contact@dawati.dz",
  instagram: "", // مثال: "dawati.dz" — اتركه فارغًا لإخفاء الأيقونة
  tiktok: "", // مثال: "dawati.dz"
};

/**
 * القوالب المعروضة في الموقع.
 * demoUrl: رابط المعاينة الحية (دعوة تجريبية حقيقية).
 * الصور من أصول القوالب الموجودة في public/ — لا حاجة لأصول جديدة.
 */
export const CATALOG = [
  {
    id: "islamic-royal",
    name: "Islamic Royal",
    badge: { ar: "الأكثر طلبًا", fr: "Le plus demandé" },
    demoUrl: "/",
    // نسخة مضغوطة خاصة بالموقع — الأصل في /assets يخدم القالب الحقيقي
    preview: "/assets/site/islamic-envelope.webp",
    previewAlt: "/assets/hero-background.webp",
    // ختم الشمع يُركّب فوق صورة الظرف (الصورة نفسها فيها تجويف فارغ)
    // top/width نسب مئوية من بطاقة المعاينة — عدّلها لضبط الموضع والحجم.
    // الختم الذهبي بالبسملة — نفس ختم القالب الحقيقي (نسخة مضغوطة).
    seal: { src: "/assets/site/islamic-seal.webp", top: "52%", width: "52%" },
    video: "/assets/templates/demo-hero.mp4",
    description: {
      ar: "ظرف مختوم بالشمع، بجعتان متحركتان، ورق حرفي فاخر بالذهبي والبورجوندي — ثنائي اللغة مع RSVP.",
      fr: "Enveloppe scellée, cygnes animés, papier artisanal or et bordeaux — bilingue FR/AR avec RSVP.",
    },
  },
  {
    id: "heritage",
    name: "Heritage",
    badge: { ar: "كلاسيكي", fr: "Classique" },
    demoUrl: "/w/WED-KXZGMF",
    preview: "/assets/site/heritage-envelope.webp",
    previewAlt: "/assets/templates/heritage-preview.svg",
    description: {
      ar: "حديقة عتيقة: ظرف بلون المريمية بختم تيراكوتا، خط منمّق، وأقسام بلون الكريم والوردي الهادئ.",
      fr: "Jardin vintage : enveloppe sauge au sceau terracotta, calligraphie raffinée, sections crème et rose poudré.",
    },
  },
  {
    id: "floral-romantic",
    name: "Floral Romantic",
    badge: { ar: "جديد", fr: "Nouveau" },
    demoUrl: "/w/WED-NP69XW",
    preview: "/assets/templates/floral-romantic/envelope-closed.webp",
    previewAlt: "/assets/templates/floral-romantic/reveal-scene.webp",
    video: "/assets/templates/floral-romantic/reveal-scene.mp4",
    seal: {
      src: "/assets/site/floral-seal.webp",
      top: "50%",
      width: "38%",
    },
    description: {
      ar: "ظرف بورجوندي منقوش بالورود بختم ذهبي، يُفتح على رحلة سينمائية بين الأعمدة الرخامية والطواويس الذهبية.",
      fr: "Enveloppe bordeaux gaufrée de roses au sceau doré, qui s'ouvre sur un voyage cinématique — paons dorés et harpe douce.",
    },
  },
  // القوالب القادمة — تظهر ببطاقة "قريبًا"
  {
    id: "luxury-gold",
    name: "Luxury Gold",
    comingSoon: true,
  },
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    comingSoon: true,
  },
];

/**
 * الباقات والأسعار — أرقام تجريبية، عدّلها بأسعارك الحقيقية.
 * السعر بالدينار الجزائري. oldPrice اختياري (يظهر مشطوبًا).
 */
export const PRICING = [
  {
    id: "essential",
    name: { ar: "الأساسية", fr: "Essentielle" },
    price: 7900,
    oldPrice: 11900,
    highlight: false,
    features: {
      ar: [
        "قالب جاهز باسميكما وتفاصيل حفلكما",
        "رابط خاص قابل للمشاركة",
        "عدّ تنازلي مباشر",
        "خريطة Google للقاعة",
        "عربي + فرنسي",
      ],
      fr: [
        "Template personnalisé à vos noms",
        "Lien privé à partager",
        "Compte à rebours en direct",
        "Carte Google Maps",
        "Arabe + Français",
      ],
    },
  },
  {
    id: "premium",
    name: { ar: "المميزة", fr: "Premium" },
    price: 9900,
    oldPrice: 14900,
    highlight: true, // الباقة المقترحة — تظهر مميزة
    features: {
      ar: [
        "كل مزايا الباقة الأساسية",
        "تأكيد الحضور RSVP مع لوحة متابعة",
        "نظام المرافقين (عدد الضيوف والأطفال)",
        "معرض صور + موسيقى خلفية",
        "تصدير قائمة الضيوف",
        "تعديلات على الألوان والنصوص",
      ],
      fr: [
        "Tout le pack Essentiel",
        "RSVP avec tableau de bord",
        "Système d'accompagnants",
        "Galerie photos + musique",
        "Export de la liste des invités",
        "Retouches couleurs et textes",
      ],
    },
  },
  {
    id: "royal",
    name: { ar: "الملكية", fr: "Royale" },
    price: 14500,
    oldPrice: 21900,
    highlight: false,
    features: {
      ar: [
        "كل مزايا الباقة المميزة",
        "تخصيص كامل للقالب حسب ذوقكما",
        "صوت افتتاح وموسيقى خاصة بكما",
        "رمز QR جاهز للطباعة",
        "أولوية في التسليم والدعم",
        "تعديلات غير محدودة",
      ],
      fr: [
        "Tout le pack Premium",
        "Personnalisation complète du design",
        "Son d'ouverture et musique sur mesure",
        "QR code prêt à imprimer",
        "Livraison et support prioritaires",
        "Retouches illimitées",
      ],
    },
  },
];

/**
 * مقارنة الدعوة الورقية بالرقمية — أرقام تقريبية للسوق الجزائري (لـ 100 دعوة).
 */
export const COMPARISON = {
  paper: [
    { label: { ar: "التصميم", fr: "Design" }, price: 5000 },
    { label: { ar: "طباعة 100 بطاقة", fr: "Impression (100)" }, price: 18000 },
    { label: { ar: "الأظرف", fr: "Enveloppes" }, price: 4000 },
    { label: { ar: "التوزيع والتنقل", fr: "Distribution" }, price: 6000 },
  ],
  digitalFrom: 7900,
};

/**
 * شريط التقييمات المتحرك قرب الـ Hero — عدّل الأرقام حسب واقع نشاطك.
 */
export const REVIEWS_STRIP = {
  rating: "4.9",
  events: { ar: "+100 حفل", fr: "+100 célébrations" },
};

/**
 * تقييمات — عيّنات للعرض فقط. استبدلها بتقييمات حقيقية من عملائك.
 * تُعرض في شريط التقييمات المتحرك وفي قسم «قالوا عنا».
 */
export const TESTIMONIALS = [
  {
    initials: "S&M",
    name: "Sara & Mohamed",
    city: { ar: "الجزائر العاصمة", fr: "Alger" },
    text: {
      ar: "الدعوة كانت أجمل من توقعاتنا، وكل الضيوف سألونا عنها. متابعة تأكيدات الحضور سهّلت علينا التنظيم كثيرًا.",
      fr: "L'invitation était encore plus belle que prévu, tous nos invités nous en ont parlé. Le suivi RSVP a énormément facilité l'organisation.",
    },
  },
  {
    initials: "A&Y",
    name: "Amina & Yacine",
    city: { ar: "وهران", fr: "Oran" },
    text: {
      ar: "عائلتنا في فرنسا فتحت الدعوة بالفرنسية وعائلتنا هنا بالعربية — التفصيل هذا وحده يستحق. شكرًا على الاحترافية.",
      fr: "Notre famille en France l'a ouverte en français, la nôtre ici en arabe — ce détail vaut tout. Merci pour le professionnalisme.",
    },
  },
  {
    initials: "R&K",
    name: "Rym & Karim",
    city: { ar: "قسنطينة", fr: "Constantine" },
    text: {
      ar: "فتح الظرف مع الموسيقى أبهر الجميع. طلبنا تعديل الألوان وتمّ في نفس اليوم.",
      fr: "L'ouverture de l'enveloppe avec la musique a impressionné tout le monde. Les retouches de couleurs ont été faites le jour même.",
    },
  },
  {
    initials: "I&A",
    name: "Ines & Amine",
    city: { ar: "عنابة", fr: "Annaba" },
    text: {
      ar: "طلبنا الدعوة قبل أسبوع فقط من الحفل ووصلتنا خلال يومين. الرد سريع والتعامل راقٍ جدًا.",
      fr: "Commandée une semaine avant la fête, reçue en deux jours. Réponses rapides et un service très soigné.",
    },
  },
  {
    initials: "L&S",
    name: "Lina & Sofiane",
    city: { ar: "سطيف", fr: "Sétif" },
    text: {
      ar: "رمز QR على البطاقات المطبوعة كان فكرة عبقرية — كبار العائلة أخذوا البطاقة والشباب فتحوا الرابط.",
      fr: "Le QR code sur les cartes imprimées était une idée géniale — les aînés ont gardé la carte, les jeunes ont ouvert le lien.",
    },
  },
  {
    initials: "M&W",
    name: "Meriem & Walid",
    city: { ar: "تلمسان", fr: "Tlemcen" },
    text: {
      ar: "لوحة متابعة الضيوف وفّرت علينا عشرات المكالمات. عرفنا العدد النهائي قبل القاعة بأيام.",
      fr: "Le tableau de suivi des invités nous a épargné des dizaines d'appels. On connaissait le nombre final bien avant la salle.",
    },
  },
];

/** الأسئلة الشائعة */
export const FAQ = [
  {
    q: {
      ar: "كيف أطلب دعوتي؟",
      fr: "Comment commander mon invitation ?",
    },
    a: {
      ar: "اختر القالب الذي أعجبك واضغط «اطلب هذا القالب» — يفتح واتساب برسالة جاهزة. نتفق على التفاصيل ونبدأ التصميم مباشرة.",
      fr: "Choisissez votre template et cliquez sur « Commander » — WhatsApp s'ouvre avec un message prêt. On valide les détails et on commence directement.",
    },
  },
  {
    q: {
      ar: "كم يستغرق تجهيز الدعوة؟",
      fr: "Quel est le délai de livraison ?",
    },
    a: {
      ar: "عادة بين 24 و72 ساعة حسب الباقة، مع إمكانية الاستعجال عند الحاجة.",
      fr: "Généralement entre 24 et 72 heures selon le pack, avec option express si besoin.",
    },
  },
  {
    q: {
      ar: "هل يمكن تعديل الألوان والنصوص؟",
      fr: "Peut-on modifier les couleurs et les textes ?",
    },
    a: {
      ar: "نعم — الأسماء، التواريخ، الآيات، الألوان، الصور والموسيقى كلها قابلة للتخصيص حسب باقتك.",
      fr: "Oui — noms, dates, textes, couleurs, photos et musique sont personnalisables selon votre pack.",
    },
  },
  {
    q: {
      ar: "كيف يؤكد الضيوف حضورهم؟",
      fr: "Comment les invités confirment-ils leur présence ?",
    },
    a: {
      ar: "داخل الدعوة نموذج بسيط يؤكد فيه الضيف حضوره وعدد مرافقيه، وتصلك النتائج مباشرة في لوحة متابعة خاصة بكما.",
      fr: "L'invitation contient un formulaire simple : chaque invité confirme sa présence et ses accompagnants, et vous suivez tout en temps réel sur votre tableau de bord.",
    },
  },
  {
    q: {
      ar: "هل الدعوة تعمل على كل الهواتف؟",
      fr: "L'invitation fonctionne-t-elle sur tous les téléphones ?",
    },
    a: {
      ar: "نعم، الدعوة رابط يُفتح من أي هاتف أو حاسوب دون تحميل أي تطبيق.",
      fr: "Oui, c'est un simple lien qui s'ouvre sur n'importe quel téléphone ou ordinateur, sans application.",
    },
  },
  {
    q: {
      ar: "هل يمكن طباعة رمز QR على بطاقات ورقية؟",
      fr: "Peut-on imprimer un QR code ?",
    },
    a: {
      ar: "نعم، نوفر لك رمز QR أنيقًا جاهزًا للطباعة على بطاقات Save the Date أو لافتات القاعة.",
      fr: "Oui, nous fournissons un QR code élégant prêt à imprimer sur vos cartons ou à l'entrée de la salle.",
    },
  },
];

/** يبني رابط واتساب برسالة جاهزة، أو يرجع null إذا لم يُضبط الرقم بعد.
 *  number اختياري — مرّر قيمة useSiteWhatsApp() لقراءة الرقم المحفوظ
 *  في لوحة التحكم؛ بدونها يُستعمل رقم site-config الثابت. */
export function whatsappLink(message, number) {
  const num = (number ?? SITE.whatsappNumber) || "";
  if (!/^\d{8,15}$/.test(num)) return null;
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

export function formatDZD(n, lang) {
  const s = new Intl.NumberFormat(lang === "ar" ? "ar-DZ" : "fr-DZ").format(n);
  return lang === "ar" ? `${s} دج` : `${s} DA`;
}
