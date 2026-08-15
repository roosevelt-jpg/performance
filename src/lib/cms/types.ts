/** Editable site content — all public copy, CTAs, banners, media. */

export type CmsLink = {
  id: string;
  label: string;
  href: string;
  visible: boolean;
};

export type CmsCta = {
  label: string;
  href: string;
};

/** Where a media section renders on the home page. */
export type CmsMediaSlot =
  | "after-hero"
  | "after-vsl"
  | "after-proof"
  | "after-testimonials"
  | "after-problem"
  | "after-how"
  | "before-tiers"
  | "after-tiers"
  | "before-faq"
  | "after-faq"
  | "before-final";

export const CMS_MEDIA_SLOT_OPTIONS: { id: CmsMediaSlot; label: string }[] = [
  { id: "after-hero", label: "After hero" },
  { id: "after-vsl", label: "After VSL video" },
  { id: "after-proof", label: "After proof strip" },
  { id: "after-testimonials", label: "After testimonials" },
  { id: "after-problem", label: "After problem" },
  { id: "after-how", label: "After how it works" },
  { id: "before-tiers", label: "Before programmes" },
  { id: "after-tiers", label: "After programmes" },
  { id: "before-faq", label: "Before FAQ" },
  { id: "after-faq", label: "After FAQ" },
  { id: "before-final", label: "Before final CTA" },
];

export type CmsImageBannerItem = {
  id: string;
  enabled: boolean;
  /** Public path under /assets/... after upload */
  url: string;
  alt: string;
  caption: string;
  cta: CmsCta;
};

/** Distinct image banner block (can hold one or many images). */
export type CmsImageSection = {
  id: string;
  enabled: boolean;
  slot: CmsMediaSlot;
  heading: string;
  subhead: string;
  layout: "full" | "split" | "grid";
  images: CmsImageBannerItem[];
};

export type CmsVideoItem = {
  id: string;
  enabled: boolean;
  title: string;
  body: string;
  /** YouTube watch/share/embed URL or raw video id */
  youtubeUrl: string;
  /** Optional custom poster from /assets */
  thumbnailUrl: string;
};

/** Distinct video block with one or more in-page YouTube embeds. */
export type CmsVideoSection = {
  id: string;
  enabled: boolean;
  slot: CmsMediaSlot;
  heading: string;
  subhead: string;
  videos: CmsVideoItem[];
};

export type CmsTierCta =
  | { kind: "checkout"; label: string; href: string }
  | { kind: "book"; label: string; bookTier: "pro" | "elite" }
  | { kind: "link"; label: string; href: string };

export type CmsTier = {
  id: string;
  enabled: boolean;
  highlight: boolean;
  name: string;
  badge: string;
  subhead: string;
  body: string[];
  includes: string[];
  cta: CmsTierCta;
  applyBadge: string;
};

export type CmsProofItem = {
  id: string;
  value: string;
  label: string;
};

export type CmsStep = {
  id: string;
  title: string;
  body: string;
};

export type CmsFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type CmsTestimonial = {
  id: string;
  enabled: boolean;
  quote: string;
  name: string;
  result: string;
  /** After photo — paired with beforeImageUrl for the hover compare */
  imageUrl: string;
  /** Before photo — admin upload; hover/drag on the card reveals after */
  beforeImageUrl: string;
  imageAlt: string;
};

export type CmsCoachStep = {
  id: string;
  title: string;
  body: string;
};

export type CmsWhatsappCoach = {
  enabled: boolean;
  eyebrow: string;
  heading: string;
  body: string;
  steps: CmsCoachStep[];
  chatName: string;
  chatTime: string;
  chatMessage: string;
  avatarUrl: string;
};

export type CmsCredentials = {
  enabled: boolean;
  eyebrow: string;
  heading: string;
  body: string;
  imageUrl: string;
  imageAlt: string;
  caption: string;
  followerCount: string;
  followerHref: string;
  items: CmsProofItem[];
};

export type CmsBenchmarks = {
  enabled: boolean;
  eyebrow: string;
  heading: string;
  body: string;
  items: CmsProofItem[];
};

export type CmsChallengeOffer = {
  enabled: boolean;
  anchorPrice: string;
  livePrice: string;
  addonLabel: string;
  addonValue: string;
  addonPrice: string;
  totalSaving: string;
  recurringTerms: string;
  offerEnd: string;
  placesRemaining: string;
};

export type CmsGuarantee = {
  enabled: boolean;
  guarantee: string;
  trustLine: string;
};

export type CmsVsl = {
  enabled: boolean;
  stepLabel: string;
  heading: string;
  helper: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  muteHint: string;
  applyStepLabel: string;
  applyCta: CmsCta;
  applyNote: string;
  requireWatch: boolean;
  gateTitle: string;
  gateBody: string;
  gateCta: string;
};

export type CmsDisclaimer = {
  enabled: boolean;
  text: string;
};

export type CmsContent = {
  site: {
    brand: {
      name: string;
      product: string;
      coach: string;
      siteUrl: string;
      wordmark: string;
      accent: string;
      logoUrl: string;
    };
    seo: {
      title: string;
      description: string;
      keywords: string;
      ogImageUrl: string;
    };
  };
  chrome: {
    headerLogoHref: string;
    nav: CmsLink[];
    footerCopyright: string;
    footerLinks: CmsLink[];
  };
  home: {
    hero: {
      eyebrow: string;
      headline: string;
      body: string;
      cta: CmsCta;
      ctaNote: string;
      secondaryCta: CmsCta;
      mediaType: "none" | "image" | "video" | "youtube";
      mediaUrl: string;
      mediaPoster: string;
      mediaAlt: string;
      /** Kane portrait shown below the CTAs, not behind them */
      portraitUrl: string;
      portraitAlt: string;
    };
    vsl: CmsVsl;
    proof: {
      enabled: boolean;
      items: CmsProofItem[];
    };
    problem: {
      enabled: boolean;
      eyebrow: string;
      title: string;
      body: string;
    };
    credentials: CmsCredentials;
    whatsappCoach: CmsWhatsappCoach;
    benchmarks: CmsBenchmarks;
    howItWorks: {
      enabled: boolean;
      heading: string;
      subhead: string;
      steps: CmsStep[];
    };
    tiersSection: {
      enabled: boolean;
      heading: string;
      subhead: string;
      offer: CmsChallengeOffer;
      guarantee: CmsGuarantee;
    };
    faq: {
      enabled: boolean;
      heading: string;
      items: CmsFaqItem[];
    };
    finalCta: {
      enabled: boolean;
      title: string;
      body: string;
      primary: CmsCta;
      secondary: CmsCta;
    };
    testimonials: {
      enabled: boolean;
      heading: string;
      subhead: string;
      items: CmsTestimonial[];
    };
    disclaimer: CmsDisclaimer;
    popups: {
      email: {
        enabled: boolean;
        delayMs: number;
        title: string;
        body: string;
        placeholder: string;
        cta: string;
        success: string;
        privacy: string;
      };
      reviews: {
        enabled: boolean;
        delayMs: number;
        title: string;
        ctaLabel: string;
        ctaHref: string;
      };
    };
    stickyCta: {
      enabled: boolean;
      label: string;
      href: string;
    };
    /** Separate image banner sections (upload to /assets). */
    imageSections: CmsImageSection[];
    /** Separate video sections (YouTube embeds play on-site). */
    videoSections: CmsVideoSection[];
  };
  tiers: CmsTier[];
  questionnaire: {
    back: CmsCta;
    title: string;
    introMobile: string;
    introDesktop: string;
    progressLabel: string;
    goals: string[];
    trainingNow: string[];
    daysCommit: string[];
    investment: string[];
    fieldLabels: {
      name: string;
      email: string;
      mobile: string;
      instagram: string;
      medical: string;
      stoppedResults: string;
      whyNow: string;
      structuredProgramme: string;
    };
    placeholders: {
      instagram: string;
      medical: string;
    };
    stepTitles: string[];
    step6Helper: string;
    step9Prompt: string;
    medicalPrivacy: string;
    consentLabel: string;
    consentWhatsappNote: string;
    buttons: {
      back: string;
      continue: string;
      submit: string;
      submitting: string;
    };
  };
  challenge: {
    title: string;
    body: string;
    cta: CmsCta;
    checkoutHeading: string;
    checkoutBody: string;
    disqualifyEyebrow: string;
    disqualifyReasons: {
      commitment: string;
      investment: string;
      both: string;
    };
  };
  calendar: {
    title: string;
    subhead: string;
    proEventLabel: string;
    eliteEventLabel: string;
    missingTitle: string;
    missingBody: string;
    bookedContinue: string;
    devContinue: string;
  };
  confirmation: {
    eyebrow: string;
    title: string;
    body: string;
    whatsappLabel: string;
    save: string;
    saving: string;
    saved: string;
  };
  /** Autonomous apply chat + short-landing layout. Admin → Funnel. */
  funnel: CmsFunnel;
};

export type CmsFunnelField =
  | "message"
  | "tier"
  | "name"
  | "email"
  | "mobile"
  | "instagram"
  | "mainGoal"
  | "trainingNow"
  | "daysCommit"
  | "medical"
  | "stoppedResults"
  | "whyNow"
  | "structuredProgramme"
  | "investment"
  | "privacy";

export type CmsFunnelStep = {
  id: string;
  enabled: boolean;
  field: CmsFunnelField;
  coachText: string;
  /** Input placeholder, or the button label on message / privacy steps. */
  placeholder: string;
};

export type CmsFunnelLayout = {
  phoneMockup: boolean;
  vsl: boolean;
  proof: boolean;
  testimonials: boolean;
  credentials: boolean;
  problem: boolean;
  whatsappCoach: boolean;
  benchmarks: boolean;
  howItWorks: boolean;
  tiers: boolean;
  faq: boolean;
  finalCta: boolean;
};

export type CmsFunnelOpenOn = "cta" | "delay" | "after-vsl";

export type CmsFunnel = {
  enabled: boolean;
  coachName: string;
  avatarUrl: string;
  launcherLabel: string;
  greeting: string;
  openOn: CmsFunnelOpenOn;
  delayMs: number;
  defaultTier: "pro" | "elite";
  startButton: string;
  qualifiedMessage: string;
  qualifiedCta: string;
  disqualifiedMessage: string;
  disqualifiedCta: string;
  submittingText: string;
  errorText: string;
  layout: CmsFunnelLayout;
  steps: CmsFunnelStep[];
};
