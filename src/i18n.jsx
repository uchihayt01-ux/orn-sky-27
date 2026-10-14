import { createContext, useContext, useEffect, useState } from 'react';

const en = {
  dir: 'ltr',
  nav: { overview: 'Overview', figures: 'Key figures', sectors: 'Sectors', sponsorship: 'Sponsorship', venue: 'Venue', contact: 'Contact', cta: 'Sponsorship enquiry' },
  hero: {
    label: 'International Aircraft Exhibition',
    lead: 'The international exhibition for aviation and air transport in western Algeria — bringing airlines, training organisations, simulation providers, equipment manufacturers and drone companies together with buyers, institutions and partners.',
    dateK: 'Dates', date: 'September 2027',
    venueK: 'Venue', venue: 'Le Méridien Oran',
    cityK: 'City', city: 'Oran, Algeria',
    primary: 'Sponsorship opportunities',
    secondary: 'Exhibit at ORN SKY 27',
  },
  overview: {
    label: 'Overview',
    title: 'A business platform for the aviation industry in Algeria.',
    p1: 'ORN SKY 27 brings together the companies that build, operate and support aviation — from airlines and academies to manufacturers of systems and unmanned aircraft — for an exhibition dedicated to trade, partnerships and recruitment.',
    p2: 'Hosted at Le Méridien Oran Hotel & Convention Centre, the event gives sponsors direct visibility with an audience of professionals, institutions and decision-makers.',
    factsTitle: 'Key facts',
    rows: [
      { k: 'Dates', v: 'September 2027' },
      { k: 'Venue', v: 'Le Méridien Oran Hotel & Convention Centre' },
      { k: 'Exhibition floor', v: '6,000 m²' },
      { k: 'Exhibitors', v: '120 stands — 40 confirmed' },
      { k: 'Visitors', v: 'approx. 3,000 expected' },
      { k: 'Format', v: 'International trade exhibition' },
    ],
  },
  figures: {
    label: 'Key figures',
    items: [
      { k: 'surface', unit: 'm²', l: 'Exhibition floor' },
      { k: 'exhibitorsCapacity', l: 'Exhibitor stands' },
      { k: 'exhibitorsConfirmed', l: 'Exhibitors confirmed' },
      { k: 'visitors', prefix: '≈', l: 'Expected visitors' },
    ],
    booked: 'Stands reserved',
    left: 'stands available',
  },
  sectors: {
    label: 'Exhibitor profile',
    title: 'Five sectors represented',
    intro: 'Exhibitors and visitors come from five complementary sectors of the aviation industry.',
    items: [
      { t: 'Airlines & air transport', d: 'Passenger and cargo carriers, airports and ground-handling providers.' },
      { t: 'Training companies & academies', d: 'Flight schools, cabin-crew and maintenance training, aviation universities.' },
      { t: 'Flight simulation', d: 'Full-flight simulators, procedure trainers and training technology.' },
      { t: 'Equipment & systems', d: 'Developers and manufacturers of avionics, components, tooling and systems.' },
      { t: 'Drones & unmanned systems', d: 'UAV manufacturers, counter-drone solutions and autonomous systems.' },
    ],
  },
  sponsors: {
    label: 'Sponsorship',
    title: 'Sponsorship packages',
    intro: 'Three levels of partnership, each with defined visibility and hospitality benefits. Every package can be adapted to your objectives.',
    tiers: [
      { name: 'Platinum', role: 'Title partner' },
      { name: 'Gold', role: 'Official partner' },
      { name: 'Silver', role: 'Supporting partner' },
    ],
    benefit: 'Benefits',
    rows: [
      { k: 'Title naming (“presented by”)', v: [true, false, false] },
      { k: 'Speaking slot at the opening ceremony', v: [true, false, false] },
      { k: 'Participation in a panel session', v: [true, true, false] },
      { k: 'Exhibition stand', v: ['Premium, main entrance', 'Prime location', 'Standard'] },
      { k: 'Logo on website and printed guide', v: [true, true, true] },
      { k: 'Logo on venue signage', v: [true, true, false] },
      { k: 'Logo on main stage, badges and lanyards', v: [true, false, false] },
      { k: 'Media and social media', v: ['Dedicated campaign', 'Featured posts', 'Newsletter mention'] },
      { k: 'Invitations', v: ['VIP passes, gala dinner table', 'VIP passes', 'Visitor passes'] },
    ],
    availability: { k: 'Availability', v: ['Exclusive', 'Limited', 'Limited'] },
    price: { k: 'Investment', v: 'On request' },
    customTitle: 'Tailored partnerships',
    customBody: 'Associate your brand with a specific part of the exhibition:',
    custom: ['Drone zone', 'Simulator area', 'Conference stage', 'VIP lounge', 'Badges & lanyards', 'Networking evening'],
    note: 'Full details and pricing are provided in the sponsorship brochure.',
    cta: 'Request the brochure',
  },
  venue: {
    label: 'Venue',
    title: 'Le Méridien Oran Hotel & Convention Centre',
    body: 'Oran is Algeria’s second city and its main gateway on the Mediterranean, served by Ahmed Ben Bella International Airport — whose code, ORN, gives the exhibition its name.',
    facts: [
      { k: 'City', v: 'Oran, Algeria' },
      { k: 'Dates', v: 'September 2027' },
      { k: 'Exhibition floor', v: '6,000 m²' },
      { k: 'Airport', v: 'Oran Ahmed Ben Bella (ORN)' },
    ],
    map: 'Open in Google Maps',
    mapTitle: 'Map — Le Méridien Oran',
  },
  why: {
    label: 'Why sponsor',
    title: 'What a partnership delivers',
    items: [
      { t: 'Visibility', d: 'Your brand on signage, the website, printed material, press and social media — before, during and after the exhibition.' },
      { t: 'Access', d: 'Meetings with airline executives, training directors, procurement teams and institutional delegations.' },
      { t: 'Positioning', d: 'Speaking opportunities that place your company among the reference players in Algerian aviation.' },
      { t: 'Market', d: 'A direct route into Algeria, North Africa and the wider Mediterranean aviation market.' },
    ],
  },
  cta: {
    label: 'Contact',
    title: 'Discuss a partnership',
    body: 'Request the sponsorship brochure with full package details and pricing, or contact the organising team to build a tailored proposal.',
    primary: 'Request the brochure',
    secondary: 'Book an exhibition stand',
    emailK: 'Email',
    mailPrimary: 'ORN SKY 27 — Sponsorship brochure request',
    mailSecondary: 'ORN SKY 27 — Exhibition stand booking',
  },
  footer: {
    tagline: 'International Aircraft Exhibition — Le Méridien Oran, September 2027.',
    event: 'Exhibition',
    contact: 'Contact',
    rights: 'All rights reserved.',
    top: 'Back to top',
  },
};

const fr = {
  dir: 'ltr',
  nav: { overview: 'Présentation', figures: 'Chiffres clés', sectors: 'Secteurs', sponsorship: 'Sponsoring', venue: 'Lieu', contact: 'Contact', cta: 'Demande de sponsoring' },
  hero: {
    label: 'Salon International de l’Aéronautique',
    lead: 'Le salon international de l’aviation et du transport aérien de l’Ouest algérien — réunissant compagnies aériennes, organismes de formation, fournisseurs de simulation, fabricants d’équipements et sociétés de drones avec acheteurs, institutions et partenaires.',
    dateK: 'Dates', date: 'Septembre 2027',
    venueK: 'Lieu', venue: 'Le Méridien Oran',
    cityK: 'Ville', city: 'Oran, Algérie',
    primary: 'Offres de sponsoring',
    secondary: 'Exposer à ORN SKY 27',
  },
  overview: {
    label: 'Présentation',
    title: 'Une plateforme d’affaires pour l’industrie aéronautique en Algérie.',
    p1: 'ORN SKY 27 réunit les entreprises qui conçoivent, exploitent et soutiennent l’aviation — des compagnies aériennes et académies aux fabricants de systèmes et d’aéronefs sans pilote — autour d’un salon dédié aux affaires, aux partenariats et au recrutement.',
    p2: 'Organisé au Méridien Oran Hôtel & Centre de Conventions, l’événement offre aux sponsors une visibilité directe auprès de professionnels, d’institutions et de décideurs.',
    factsTitle: 'L’essentiel',
    rows: [
      { k: 'Dates', v: 'Septembre 2027' },
      { k: 'Lieu', v: 'Le Méridien Oran Hôtel & Centre de Conventions' },
      { k: 'Surface d’exposition', v: '6 000 m²' },
      { k: 'Exposants', v: '120 stands — 40 confirmés' },
      { k: 'Visiteurs', v: 'environ 3 000 attendus' },
      { k: 'Format', v: 'Salon professionnel international' },
    ],
  },
  figures: {
    label: 'Chiffres clés',
    items: [
      { k: 'surface', unit: 'm²', l: 'Surface d’exposition' },
      { k: 'exhibitorsCapacity', l: 'Stands exposants' },
      { k: 'exhibitorsConfirmed', l: 'Exposants confirmés' },
      { k: 'visitors', prefix: '≈', l: 'Visiteurs attendus' },
    ],
    booked: 'Stands réservés',
    left: 'stands disponibles',
  },
  sectors: {
    label: 'Profil des exposants',
    title: 'Cinq secteurs représentés',
    intro: 'Exposants et visiteurs sont issus de cinq secteurs complémentaires de l’industrie aéronautique.',
    items: [
      { t: 'Compagnies aériennes & transport aérien', d: 'Transporteurs passagers et cargo, aéroports et services d’assistance au sol.' },
      { t: 'Écoles & académies de formation', d: 'Écoles de pilotage, formation PNC et maintenance, universités aéronautiques.' },
      { t: 'Simulation de vol', d: 'Simulateurs de vol, entraîneurs de procédures et technologies de formation.' },
      { t: 'Équipements & systèmes', d: 'Développeurs et fabricants d’avionique, de composants, d’outillage et de systèmes.' },
      { t: 'Drones & systèmes sans pilote', d: 'Fabricants d’UAV, solutions anti-drones et systèmes autonomes.' },
    ],
  },
  sponsors: {
    label: 'Sponsoring',
    title: 'Offres de sponsoring',
    intro: 'Trois niveaux de partenariat, chacun avec des avantages définis en visibilité et en hospitalité. Chaque offre peut être adaptée à vos objectifs.',
    tiers: [
      { name: 'Platinum', role: 'Partenaire titre' },
      { name: 'Gold', role: 'Partenaire officiel' },
      { name: 'Silver', role: 'Partenaire associé' },
    ],
    benefit: 'Avantages',
    rows: [
      { k: 'Mention « présenté par »', v: [true, false, false] },
      { k: 'Prise de parole à la cérémonie d’ouverture', v: [true, false, false] },
      { k: 'Participation à une table ronde', v: [true, true, false] },
      { k: 'Stand d’exposition', v: ['Premium, entrée principale', 'Emplacement privilégié', 'Standard'] },
      { k: 'Logo sur le site et le guide imprimé', v: [true, true, true] },
      { k: 'Logo sur la signalétique', v: [true, true, false] },
      { k: 'Logo sur la scène, les badges et tours de cou', v: [true, false, false] },
      { k: 'Médias et réseaux sociaux', v: ['Campagne dédiée', 'Publications dédiées', 'Mention newsletter'] },
      { k: 'Invitations', v: ['Pass VIP, table au dîner de gala', 'Pass VIP', 'Pass visiteurs'] },
    ],
    availability: { k: 'Disponibilité', v: ['Exclusif', 'Limité', 'Limité'] },
    price: { k: 'Investissement', v: 'Sur demande' },
    customTitle: 'Partenariats sur mesure',
    customBody: 'Associez votre marque à un espace précis du salon :',
    custom: ['Zone drones', 'Espace simulateurs', 'Scène conférences', 'Salon VIP', 'Badges & tours de cou', 'Soirée networking'],
    note: 'Le détail des offres et les tarifs figurent dans la brochure de sponsoring.',
    cta: 'Demander la brochure',
  },
  venue: {
    label: 'Lieu',
    title: 'Le Méridien Oran Hôtel & Centre de Conventions',
    body: 'Oran est la deuxième ville d’Algérie et sa principale porte sur la Méditerranée, desservie par l’aéroport international Ahmed Ben Bella — dont le code, ORN, donne son nom au salon.',
    facts: [
      { k: 'Ville', v: 'Oran, Algérie' },
      { k: 'Dates', v: 'Septembre 2027' },
      { k: 'Surface d’exposition', v: '6 000 m²' },
      { k: 'Aéroport', v: 'Oran Ahmed Ben Bella (ORN)' },
    ],
    map: 'Ouvrir dans Google Maps',
    mapTitle: 'Carte — Le Méridien Oran',
  },
  why: {
    label: 'Pourquoi sponsoriser',
    title: 'Ce qu’apporte un partenariat',
    items: [
      { t: 'Visibilité', d: 'Votre marque sur la signalétique, le site, les supports imprimés, la presse et les réseaux — avant, pendant et après le salon.' },
      { t: 'Accès', d: 'Rencontres avec dirigeants de compagnies, directeurs de formation, acheteurs et délégations institutionnelles.' },
      { t: 'Positionnement', d: 'Des prises de parole qui placent votre entreprise parmi les acteurs de référence de l’aviation algérienne.' },
      { t: 'Marché', d: 'Un accès direct à l’Algérie, à l’Afrique du Nord et au marché aéronautique méditerranéen.' },
    ],
  },
  cta: {
    label: 'Contact',
    title: 'Parlons partenariat',
    body: 'Demandez la brochure de sponsoring avec le détail des offres et les tarifs, ou contactez l’équipe d’organisation pour une proposition sur mesure.',
    primary: 'Demander la brochure',
    secondary: 'Réserver un stand',
    emailK: 'E-mail',
    mailPrimary: 'ORN SKY 27 — Demande de brochure de sponsoring',
    mailSecondary: 'ORN SKY 27 — Réservation de stand',
  },
  footer: {
    tagline: 'Salon International de l’Aéronautique — Le Méridien Oran, septembre 2027.',
    event: 'Salon',
    contact: 'Contact',
    rights: 'Tous droits réservés.',
    top: 'Haut de page',
  },
};

const ar = {
  dir: 'rtl',
  nav: { overview: 'تقديم', figures: 'أرقام رئيسية', sectors: 'القطاعات', sponsorship: 'الرعاية', venue: 'المكان', contact: 'اتصل بنا', cta: 'طلب رعاية' },
  hero: {
    label: 'المعرض الدولي للطائرات',
    lead: 'النقل الجوي و البحري —يجمع شركات الطيران وهيئات التدريب ومزوّدي المحاكاة ومصنّعي العتاد وشركات المسيّرات مع المشترين والمؤسسات والشركاء.',
    dateK: 'التاريخ', date: 'سبتمبر 2027',
    venueK: 'المكان', venue: 'لو ميريديان وهران',
    cityK: 'المدينة', city: 'وهران، الجزائر',
    primary: 'عروض الرعاية',
    secondary: 'اعرض في ORN SKY 27',
  },
  overview: {
    label: 'تقديم',
    title: 'منصّة أعمال لصناعة الطيران في الجزائر.',
    p1: 'يجمع ORN SKY 27 الشركات التي تصنع الطيران وتشغّله وتدعمه — من شركات الطيران والأكاديميات إلى مصنّعي الأنظمة والطائرات دون طيار — في معرض مخصّص للأعمال والشراكات والتوظيف.',
    p2: 'يُقام المعرض في مركز المؤتمرات محمد بن أحمد، ويمنح الرعاة حضوراً مباشراً أمام المهنيين والمؤسسات وصنّاع القرار.',
    factsTitle: 'معلومات أساسية',
    rows: [
      { k: 'التاريخ', v: 'سبتمبر 2027' },
      { k: 'المكان', v: 'مركز المؤتمرات محمد بن أحمد' },
      { k: 'مساحة العرض', v: '6000 م²' },
      { k: 'العارضون', v: '120 جناحاً — 40 مؤكَّداً' },
      { k: 'الزوار', v: 'حوالي 3000 زائر متوقَّع' },
      { k: 'الصيغة', v: 'معرض مهني دولي' },
    ],
  },
  figures: {
    label: 'أرقام رئيسية',
    items: [
      { k: 'surface', unit: 'م²', l: 'مساحة العرض' },
      { k: 'exhibitorsCapacity', l: 'جناحاً للعارضين' },
      { k: 'exhibitorsConfirmed', l: 'عارضاً مؤكَّداً' },
      { k: 'visitors', prefix: '≈', l: 'زائر متوقَّع' },
    ],
    booked: 'الأجنحة المحجوزة',
    left: 'جناحاً متاحاً',
  },
  sectors: {
    label: 'ملف العارضين',
    title: 'خمسة قطاعات ممثَّلة',
    intro: 'ينتمي العارضون والزوار إلى خمسة قطاعات متكاملة من صناعة الطيران.',
    items: [
      { t: 'شركات الطيران والنقل الجوي', d: 'ناقلو الركاب والشحن، المطارات ومزوّدو المناولة الأرضية.' },
      { t: 'شركات وأكاديميات التدريب', d: 'مدارس الطيران، تكوين طاقم الضيافة والصيانة، الجامعات المتخصصة.' },
      { t: 'شركات المحاكاة (السيميلاتور)', d: 'أجهزة محاكاة الطيران، مدرّبات الإجراءات وتقنيات التدريب.' },
      { t: 'مطوّرو ومصنّعو العتاد والأنظمة', d: 'مطوّرو ومصنّعو إلكترونيات الطيران والمكوّنات والأدوات والأنظمة.' },
      { t: 'المسيّرات والأنظمة غير المأهولة', d: 'مصنّعو الطائرات دون طيار، حلول مكافحة المسيّرات والأنظمة الذاتية.' },
    ],
  },
  sponsors: {
    label: 'الرعاية',
    title: 'باقات الرعاية',
    intro: 'ثلاثة مستويات من الشراكة، لكلٍّ منها امتيازات محدّدة في الظهور والضيافة. يمكن تكييف كل باقة وفق أهدافكم.',
    tiers: [
      { name: 'بلاتيني', role: 'الراعي الرئيسي' },
      { name: 'ذهبي', role: 'شريك رسمي' },
      { name: 'فضي', role: 'شريك داعم' },
    ],
    benefit: 'الامتيازات',
    rows: [
      { k: 'عبارة «يقدّمه» في التسمية', v: [true, false, false] },
      { k: 'كلمة في حفل الافتتاح', v: [true, false, false] },
      { k: 'المشاركة في جلسة نقاش', v: [true, true, false] },
      { k: 'جناح العرض', v: ['مميّز عند المدخل الرئيسي', 'موقع متميّز', 'عادي'] },
      { k: 'الشعار على الموقع والدليل المطبوع', v: [true, true, true] },
      { k: 'الشعار على لافتات المكان', v: [true, true, false] },
      { k: 'الشعار على المنصّة والشارات والأشرطة', v: [true, false, false] },
      { k: 'الإعلام ومواقع التواصل', v: ['حملة مخصّصة', 'منشورات مخصّصة', 'ذكر في النشرة'] },
      { k: 'الدعوات', v: ['بطاقات VIP وطاولة في عشاء الحفل', 'بطاقات VIP', 'بطاقات زوار'] },
    ],
    availability: { k: 'التوفّر', v: ['حصري', 'محدود', 'محدود'] },
    price: { k: 'الاستثمار', v: 'عند الطلب' },
    customTitle: 'شراكات حسب الطلب',
    customBody: 'اربطوا علامتكم بفضاء محدّد من المعرض:',
    custom: ['فضاء المسيّرات', 'فضاء المحاكاة', 'منصّة المؤتمرات', 'صالون VIP', 'الشارات والأشرطة', 'أمسية التواصل'],
    note: 'التفاصيل الكاملة والأسعار متوفّرة في كتيّب الرعاية.',
    cta: 'اطلب الكتيّب',
  },
  venue: {
    label: 'المكان',
    title: 'مركز المؤتمرات محمد بن أحمد',
    body: 'وهران ثاني أكبر مدن الجزائر وبوابتها الرئيسية على المتوسط، يخدمها مطار أحمد بن بلة الدولي — ورمزه ORN هو ما أعطى المعرض اسمه.',
    facts: [
      { k: 'المدينة', v: 'وهران، الجزائر' },
      { k: 'التاريخ', v: 'سبتمبر 2027' },
      { k: 'مساحة العرض', v: '6000 م²' },
      { k: 'المطار', v: 'وهران أحمد بن بلة (ORN)' },
    ],
    map: 'افتح في خرائط Google',
    mapTitle: 'خريطة — لو ميريديان وهران',
  },
  why: {
    label: 'لماذا الرعاية',
    title: 'ما تقدّمه الشراكة',
    items: [
      { t: 'الظهور', d: 'علامتكم على اللافتات والموقع والمطبوعات والصحافة ومواقع التواصل — قبل المعرض وأثناءه وبعده.' },
      { t: 'الوصول', d: 'لقاءات مع مسؤولي شركات الطيران ومديري التدريب وفرق المشتريات والوفود المؤسساتية.' },
      { t: 'التموضع', d: 'فرص للكلمة تضع شركتكم ضمن الفاعلين المرجعيين في الطيران الجزائري.' },
      { t: 'السوق', d: 'مدخل مباشر إلى الجزائر وشمال إفريقيا وسوق الطيران المتوسطي.' },
    ],
  },
  cta: {
    label: 'اتصل بنا',
    title: 'لنتحدّث عن الشراكة',
    body: 'اطلبوا كتيّب الرعاية بتفاصيل الباقات والأسعار، أو تواصلوا مع فريق التنظيم لإعداد عرض مخصّص.',
    primary: 'اطلب الكتيّب',
    secondary: 'احجز جناح عرض',
    emailK: 'البريد الإلكتروني',
    mailPrimary: 'ORN SKY 27 — طلب كتيّب الرعاية',
    mailSecondary: 'ORN SKY 27 — حجز جناح عرض',
  },
  footer: {
    tagline: 'المعرض الدولي للطائرات — لو ميريديان وهران، سبتمبر 2027.',
    event: 'المعرض',
    contact: 'اتصل بنا',
    rights: 'جميع الحقوق محفوظة.',
    top: 'العودة للأعلى',
  },
};

export const DICT = { en, fr, ar };
export const LANGS = [
  { id: 'en', label: 'EN' },
  { id: 'fr', label: 'FR' },
  { id: 'ar', label: 'عربي' },
];

const LangCtx = createContext(null);

function initialLang() {
  try {
    const saved = localStorage.getItem('ornsky-lang');
    if (saved && DICT[saved]) return saved;
  } catch { /* storage unavailable */ }
  const nav = (navigator.language || 'en').slice(0, 2);
  return DICT[nav] ? nav : 'en';
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(initialLang);
  const t = DICT[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = t.dir;
    try { localStorage.setItem('ornsky-lang', lang); } catch { /* ignore */ }
  }, [lang, t.dir]);

  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);
