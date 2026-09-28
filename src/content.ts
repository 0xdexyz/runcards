/**
 * Every piece of copy, link and project on the site lives here.
 * It is all placeholder content: swap in your own name, work and words.
 */

export type Lang = 'en' | 'es' | 'de';

export const LANGS: ReadonlyArray<{ id: Lang; label: string }> = [
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Español' },
  { id: 'de', label: 'Deutsch' },
];

export const profile = {
  firstName: 'Run',
  lastName: 'Card',
  role: ['Creator', 'Cards'],
  email: 'hello@runcard.xyz',
  locations: [
    { id: 'lisbon', timeZone: 'Asia/Singapore' },
    { id: 'newYork', timeZone: 'America/New_York' },
  ],
  socials: [
    { label: 'X', href: 'https://x.com/' },
    { label: 'Discord', href: 'https://discord.com/' },
    { label: 'GitHub', href: 'https://github.com/' },
    { label: 'Docs', href: 'https://example.com/docs' },
  ],
} as const;

export type CityId = (typeof profile.locations)[number]['id'];

/** Generative loops played by the hero music player (see lib/audio.ts). */
export const tracks = [
  { id: 'afterglow', title: 'Genesis — Loop 01' },
  { id: 'lowtide', title: 'Ledger — Loop 02' },
  { id: 'nightbus', title: 'Mint — Loop 03' },
] as const;

export type TrackId = (typeof tracks)[number]['id'];

/** Live canvas studies shown in the card-discovery reel (see components/tools/studies.ts). */
export const tools = [
  { id: 'runner', title: 'Maya' },
  { id: 'flow', title: 'Jordan' },
  { id: 'dither', title: 'Kai' },
  { id: 'glyph', title: 'Alex' },
  { id: 'orbit', title: 'Pixel' },
] as const;

export type ToolId = (typeof tools)[number]['id'];

/** Covers are generated in lib/art.ts, keyed by campaign id. */
export const projects = [
  { id: 'northwind', name: 'Referral Campaigns', year: 'Active', url: 'https://example.com/' },
  { id: 'halcyon', name: 'Creator Promotions', year: 'Live', url: 'https://example.com/' },
  { id: 'parallax', name: 'Verified Actions', year: 'Active', url: 'https://example.com/' },
] as const;

export interface Copy {
  nav: { about: string; tools: string; work: string; create: string };
  loading: string;
  hero: {
    about: string;
    location: string;
    cities: Record<CityId, string>;
    copy: string;
    play: string;
  };
  manifesto: { left: string; right: string };
  skills: { title: string; copy: string; visual: string }[];
  tools: { label: string; scroll: string; items: { subtitle: string; copy: string }[] };
  work: { label: string; view: string; projects: { lines: string[]; copy: string }[] };
  quote: string;
  footer: {
    lead: string;
    sublead: string;
    links: string;
    language: string;
    contact: string;
    emailLabel: string;
    emailPlaceholder: string;
    send: string;
    thanks: string;
    invalid: string;
  };
  a11y: {
    openMenu: string;
    closeMenu: string;
    play: string;
    pause: string;
    prev: string;
    next: string;
    gallery: string[];
  };
}

const en: Copy = {
  nav: { about: 'How it works', tools: 'Discover', work: 'Campaigns', create: 'RUN YOUR CARD' },
  loading: 'Loading',
  hero: {
    about: 'Network',
    location: 'Live in',
    cities: { lisbon: 'Singapore', newYork: 'New York' },
    copy: 'Launch your own crypto spending card, create campaigns, activate your community, and participate in the economics of every eligible transaction.',
    play: 'Press play',
  },
  manifesto: {
    left: 'Creators launch the card',
    right: 'Communities make it grow',
  },
  skills: [
    {
      title: 'Connect',
      copy: 'Connect your X account and crypto wallet. Your X identity helps verify eligible campaign activity, while your wallet unlocks the RUN card ecosystem.',
      visual: 'X account + Wallet',
    },
    {
      title: 'Discover',
      copy: 'Explore the RUN Card and creator cards through the marketplace, browsing what the community has built and is running.',
      visual: 'RUN · Maya · Jordan · Kai',
    },
    {
      title: 'Run your card',
      copy: 'Create and run your own crypto card. Customize it, configure its rewards, and make it available to the RUN community.',
      visual: 'Card · Reward · Status: Running',
    },
    {
      title: 'Campaigns',
      copy: 'Create campaigns that grow your card. Set eligible activities, define rewards, and give your community ways to participate.',
      visual: 'Reward pool · Participants · Active',
    },
    {
      title: 'Participate',
      copy: 'Users connect X and complete eligible activities — promoting cards, completing referrals, and other creator-defined activities.',
      visual: '✓ Post · ✓ Referral · ✓ Card activity',
    },
    {
      title: 'Rewards',
      copy: 'Eligible participants receive configured rewards, tracked through the platform and reflected in their rewards balance.',
      visual: 'Available · Pending · Claimed',
    },
    {
      title: 'Grow',
      copy: 'Cards grow through community participation — track cardholders, campaigns, activity, volume and creator rewards from one ecosystem.',
      visual: 'Cardholders · Activity · Creator rewards',
    },
  ],
  tools: {
    label: 'Discover',
    scroll: 'Scroll',
    items: [
      {
        subtitle: 'Community rewards',
        copy: 'Spend crypto and unlock rewards curated by the Maya community — from campaign drops to exclusive perks.',
      },
      {
        subtitle: 'Built for the community',
        copy: 'Powered by crypto, shaped by the people who use it. Every campaign feeds back into the Jordan network.',
      },
      {
        subtitle: 'Your creator. Your card.',
        copy: 'A branded spending card that grows with its own ecosystem, from launch to everyday use.',
      },
      {
        subtitle: 'Creator-led campaigns',
        copy: "Alex's community earns eligible rewards for verified referrals and authentic promotion.",
      },
      {
        subtitle: 'Track card activity',
        copy: 'Card views, activations and campaign participation, tracked in real time as the Pixel card grows.',
      },
    ],
  },
  work: {
    label: 'Campaigns',
    view: 'View campaign',
    projects: [
      {
        lines: ['Grow through referrals', 'Reward eligible activity'],
        copy: 'Reward your community for verified referrals that bring new cardholders and activate eligible activity across your card.',
      },
      {
        lines: ['Creator-led growth', 'Authentic promotion'],
        copy: 'Let creators promote their own card through authentic content, unlocking eligible rewards for verified engagement.',
      },
      {
        lines: ['Verified engagement', 'Qualified activations'],
        copy: 'Track qualified card activations and verified actions, so rewards go only to genuine, eligible participation.',
      },
    ],
  },
  quote: '"Creators launch. Communities grow. Users spend."',
  footer: {
    lead: 'Launch your card.',
    sublead: "Creator-powered crypto payment infrastructure — from the first campaign to every eligible transaction.",
    links: 'Links',
    language: 'Language',
    contact: 'Contact',
    emailLabel: 'Email address',
    emailPlaceholder: 'Email address',
    send: 'Send',
    thanks: "Thanks — we'll be in touch",
    invalid: 'Check that address',
  },
  a11y: {
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    play: 'Play music',
    pause: 'Pause music',
    prev: 'Previous card',
    next: 'Next card',
    gallery: [
      'Grayscale study of a softly lit card surface',
      'Layered card silhouettes in side light',
      'Waves of card activity rendered in monochrome',
    ],
  },
};

const es: Copy = {
  nav: { about: 'Cómo funciona', tools: 'Descubrir', work: 'Campañas', create: 'RUN TU TARJETA' },
  loading: 'Cargando',
  hero: {
    about: 'Red',
    location: 'En vivo en',
    cities: { lisbon: 'Singapur', newYork: 'Nueva York' },
    copy: 'Lanza tu propia tarjeta cripto, crea campañas, activa a tu comunidad y participa en la economía de cada transacción elegible.',
    play: 'Reproducir',
  },
  manifesto: {
    left: 'Los creadores lanzan la tarjeta',
    right: 'Las comunidades la hacen crecer',
  },
  skills: [
    {
      title: 'Conectar',
      copy: 'Conecta tu cuenta de X y tu wallet cripto. Tu identidad de X ayuda a verificar actividad elegible de campañas, y tu wallet desbloquea el ecosistema RUN.',
      visual: 'Cuenta X + Wallet',
    },
    {
      title: 'Descubrir',
      copy: 'Explora la RUN Card y las tarjetas de creadores en el marketplace, viendo lo que la comunidad ha creado y está corriendo.',
      visual: 'RUN · Maya · Jordan · Kai',
    },
    {
      title: 'Corre tu tarjeta',
      copy: 'Crea y corre tu propia tarjeta cripto. Personalízala, configura sus recompensas y ponla a disposición de la comunidad RUN.',
      visual: 'Tarjeta · Recompensa · Estado: Activa',
    },
    {
      title: 'Campañas',
      copy: 'Crea campañas que hagan crecer tu tarjeta. Define actividades elegibles, configura recompensas y dale a tu comunidad formas de participar.',
      visual: 'Fondo de recompensa · Participantes · Activa',
    },
    {
      title: 'Participar',
      copy: 'Los usuarios conectan X y completan actividades elegibles: promocionar tarjetas, referidos y otras actividades definidas por el creador.',
      visual: '✓ Post · ✓ Referido · ✓ Actividad de tarjeta',
    },
    {
      title: 'Recompensas',
      copy: 'Los participantes elegibles reciben recompensas configuradas, registradas en la plataforma y reflejadas en su saldo de recompensas.',
      visual: 'Disponible · Pendiente · Reclamado',
    },
    {
      title: 'Crecer',
      copy: 'Las tarjetas crecen con la participación de la comunidad: sigue titulares, campañas, actividad, volumen y recompensas de creador desde un solo ecosistema.',
      visual: 'Titulares · Actividad · Recompensas de creador',
    },
  ],
  tools: {
    label: 'Descubrir',
    scroll: 'Scroll',
    items: [
      {
        subtitle: 'Recompensas de comunidad',
        copy: 'Gasta cripto y desbloquea recompensas seleccionadas por la comunidad de Maya, desde drops de campaña hasta beneficios exclusivos.',
      },
      {
        subtitle: 'Hecha para la comunidad',
        copy: 'Impulsada por cripto, moldeada por quienes la usan. Cada campaña retroalimenta la red de Jordan.',
      },
      {
        subtitle: 'Tu creador. Tu tarjeta.',
        copy: 'Una tarjeta de gasto propia que crece junto a su propio ecosistema, del lanzamiento al uso diario.',
      },
      {
        subtitle: 'Campañas lideradas por creadores',
        copy: 'La comunidad de Alex gana recompensas elegibles por referidos verificados y promoción auténtica.',
      },
      {
        subtitle: 'Sigue la actividad de la tarjeta',
        copy: 'Visitas, activaciones y participación en campañas, seguidas en tiempo real mientras crece la tarjeta de Pixel.',
      },
    ],
  },
  work: {
    label: 'Campañas',
    view: 'Ver campaña',
    projects: [
      {
        lines: ['Crece con referidos', 'Premia la actividad elegible'],
        copy: 'Premia a tu comunidad por referidos verificados que suman nuevos titulares y activan actividad elegible en tu tarjeta.',
      },
      {
        lines: ['Crecimiento liderado por creadores', 'Promoción auténtica'],
        copy: 'Deja que los creadores promocionen su propia tarjeta con contenido auténtico, desbloqueando recompensas elegibles por interacción verificada.',
      },
      {
        lines: ['Interacción verificada', 'Activaciones calificadas'],
        copy: 'Sigue las activaciones calificadas y las acciones verificadas, para que las recompensas lleguen solo a participación genuina y elegible.',
      },
    ],
  },
  quote: '«Los creadores lanzan. Las comunidades crecen. Los usuarios gastan.»',
  footer: {
    lead: 'Lanza tu tarjeta.',
    sublead: 'Infraestructura de pagos cripto impulsada por creadores, desde la primera campaña hasta cada transacción elegible.',
    links: 'Enlaces',
    language: 'Idioma',
    contact: 'Contacto',
    emailLabel: 'Correo electrónico',
    emailPlaceholder: 'Tu correo',
    send: 'Enviar',
    thanks: 'Gracias, te contactaremos pronto',
    invalid: 'Revisa esa dirección',
  },
  a11y: {
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    play: 'Reproducir música',
    pause: 'Pausar música',
    prev: 'Tarjeta anterior',
    next: 'Tarjeta siguiente',
    gallery: [
      'Estudio en escala de grises de una superficie de tarjeta con luz suave',
      'Siluetas de tarjetas en capas con luz lateral',
      'Ondas de actividad de tarjeta en monocromo',
    ],
  },
};

const de: Copy = {
  nav: { about: 'So funktioniert es', tools: 'Entdecken', work: 'Kampagnen', create: 'RUN DEINE KARTE' },
  loading: 'Lädt',
  hero: {
    about: 'Netzwerk',
    location: 'Live in',
    cities: { lisbon: 'Singapur', newYork: 'New York' },
    copy: 'Starte deine eigene Krypto-Ausgabenkarte, erstelle Kampagnen, aktiviere deine Community und beteilige dich an der Ökonomie jeder berechtigten Transaktion.',
    play: 'Abspielen',
  },
  manifesto: {
    left: 'Creator starten die Karte',
    right: 'Communities lassen sie wachsen',
  },
  skills: [
    {
      title: 'Verbinden',
      copy: 'Verbinde deinen X-Account und deine Krypto-Wallet. Deine X-Identität hilft, berechtigte Kampagnenaktivität zu verifizieren, deine Wallet schaltet das RUN-Ökosystem frei.',
      visual: 'X-Account + Wallet',
    },
    {
      title: 'Entdecken',
      copy: 'Entdecke die RUN Card und Creator-Karten im Marketplace und sieh, was die Community gebaut hat und betreibt.',
      visual: 'RUN · Maya · Jordan · Kai',
    },
    {
      title: 'Starte deine Karte',
      copy: 'Erstelle und betreibe deine eigene Krypto-Karte. Passe sie an, konfiguriere ihre Rewards und mach sie für die RUN-Community verfügbar.',
      visual: 'Karte · Reward · Status: Aktiv',
    },
    {
      title: 'Kampagnen',
      copy: 'Erstelle Kampagnen, die deine Karte wachsen lassen. Lege berechtigte Aktivitäten fest, konfiguriere Rewards und gib deiner Community Wege zur Teilnahme.',
      visual: 'Reward-Pool · Teilnehmer · Aktiv',
    },
    {
      title: 'Teilnehmen',
      copy: 'Nutzer verbinden X und erledigen berechtigte Aktivitäten — Karten promoten, Empfehlungen abschließen und andere vom Creator definierte Aktivitäten.',
      visual: '✓ Post · ✓ Empfehlung · ✓ Kartenaktivität',
    },
    {
      title: 'Rewards',
      copy: 'Berechtigte Teilnehmer erhalten konfigurierte Rewards, die über die Plattform verfolgt und im Reward-Saldo angezeigt werden.',
      visual: 'Verfügbar · Ausstehend · Eingelöst',
    },
    {
      title: 'Wachsen',
      copy: 'Karten wachsen durch Community-Teilnahme — verfolge Karteninhaber, Kampagnen, Aktivität, Volumen und Creator-Rewards an einem Ort.',
      visual: 'Karteninhaber · Aktivität · Creator-Rewards',
    },
  ],
  tools: {
    label: 'Entdecken',
    scroll: 'Scroll',
    items: [
      {
        subtitle: 'Community-Rewards',
        copy: 'Gib Krypto aus und schalte Rewards frei, kuratiert von der Maya-Community — von Kampagnen-Drops bis zu exklusiven Vorteilen.',
      },
      {
        subtitle: 'Für die Community gebaut',
        copy: 'Angetrieben von Krypto, geformt von den Menschen, die sie nutzen. Jede Kampagne fließt zurück ins Jordan-Netzwerk.',
      },
      {
        subtitle: 'Dein Creator. Deine Karte.',
        copy: 'Eine gebrandete Ausgabenkarte, die mit ihrem eigenen Ökosystem wächst, vom Start bis zur täglichen Nutzung.',
      },
      {
        subtitle: 'Von Creators geführte Kampagnen',
        copy: 'Alex’ Community verdient berechtigte Rewards für verifizierte Empfehlungen und authentische Promotion.',
      },
      {
        subtitle: 'Kartenaktivität verfolgen',
        copy: 'Aufrufe, Aktivierungen und Kampagnenbeteiligung, in Echtzeit verfolgt, während die Pixel-Karte wächst.',
      },
    ],
  },
  work: {
    label: 'Kampagnen',
    view: 'Kampagne ansehen',
    projects: [
      {
        lines: ['Wachstum durch Empfehlungen', 'Berechtigte Aktivität belohnen'],
        copy: 'Belohne deine Community für verifizierte Empfehlungen, die neue Karteninhaber bringen und berechtigte Aktivität auf deiner Karte auslösen.',
      },
      {
        lines: ['Von Creators geführtes Wachstum', 'Authentische Promotion'],
        copy: 'Lass Creator ihre eigene Karte mit authentischem Content bewerben und berechtigte Rewards für verifiziertes Engagement freischalten.',
      },
      {
        lines: ['Verifiziertes Engagement', 'Qualifizierte Aktivierungen'],
        copy: 'Verfolge qualifizierte Kartenaktivierungen und verifizierte Aktionen, damit Rewards nur an echte, berechtigte Teilnahme gehen.',
      },
    ],
  },
  quote: '„Creator starten. Communities wachsen. Nutzer geben aus.“',
  footer: {
    lead: 'Starte deine Karte.',
    sublead: 'Von Creators angetriebene Krypto-Zahlungsinfrastruktur — von der ersten Kampagne bis zu jeder berechtigten Transaktion.',
    links: 'Links',
    language: 'Sprache',
    contact: 'Kontakt',
    emailLabel: 'E-Mail-Adresse',
    emailPlaceholder: 'Deine E-Mail',
    send: 'Senden',
    thanks: 'Danke — wir melden uns',
    invalid: 'Bitte Adresse prüfen',
  },
  a11y: {
    openMenu: 'Menü öffnen',
    closeMenu: 'Menü schließen',
    play: 'Musik abspielen',
    pause: 'Musik pausieren',
    prev: 'Vorherige Karte',
    next: 'Nächste Karte',
    gallery: [
      'Graustufenstudie einer weich beleuchteten Kartenoberfläche',
      'Geschichtete Kartensilhouetten im Seitenlicht',
      'Wellen von Kartenaktivität in Monochrom',
    ],
  },
};

export const COPY: Record<Lang, Copy> = { en, es, de };
