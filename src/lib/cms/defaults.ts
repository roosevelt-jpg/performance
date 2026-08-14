import type { CmsContent } from "./types";

export const DEFAULT_CMS: CmsContent = {
  site: {
    brand: {
      name: "The Formula Performance",
      product: "Performance coaching",
      coach: "Kane",
      siteUrl: "https://marketing.theformulaperformance.com/",
      wordmark: "The Formula",
      accent: "Performance",
    },
    seo: {
      title: "The Formula Performance | Watch the video. Apply for coaching.",
      description:
        "Watch the video to see if you qualify. Apply for Pro or Elite with Kane — or join the 8-Week Challenge.",
    },
  },
  chrome: {
    headerLogoHref: "/",
    nav: [
      {
        id: "programmes",
        label: "Programmes",
        href: "/#tiers",
        visible: true,
      },
      {
        id: "admin",
        label: "Admin",
        href: "/admin/login",
        visible: false,
      },
    ],
    footerCopyright: "© The Formula Performance",
    footerLinks: [
      {
        id: "programmes",
        label: "Programmes",
        href: "/#tiers",
        visible: true,
      },
      {
        id: "shop",
        label: "Shop",
        href: "https://theformulaperformance.com/",
        visible: true,
      },
      {
        id: "admin",
        label: "Admin",
        href: "/admin/content",
        visible: false,
      },
    ],
  },
  home: {
    hero: {
      eyebrow: "For people who are done starting over",
      headline: "Stop guessing. Get coached like it matters.",
      body: "No leftover PDFs. No two-hour sessions you will skip. Kane builds the plan around your week and keeps you on it. Watch the video to see if you qualify.",
      cta: { label: "Watch the video", href: "#vsl" },
      ctaNote: "Then apply. No card required for Pro or Elite.",
      secondaryCta: { label: "Compare programmes", href: "#tiers" },
      mediaType: "none",
      mediaUrl: "",
      mediaPoster: "",
      mediaAlt: "Athletes training with The Formula Performance",
    },
    vsl: {
      enabled: true,
      stepLabel: "Step 1",
      heading: "Watch this video to see if you qualify",
      helper:
        "The application asks if you watched the whole video. It covers how Pro and Elite work, who gets in, and what happens after you apply. Skip it and the application will not make sense.",
      youtubeUrl: "",
      thumbnailUrl: "",
      muteHint: "Tap to unmute",
      applyStepLabel: "Step 2",
      applyCta: { label: "Apply for Pro coaching", href: "/book?tier=pro" },
      applyNote: "Takes a few minutes. No card required to apply.",
      requireWatch: true,
      gateTitle: "Hold up. Watch the video first.",
      gateBody:
        "The video answers most questions before you ever get on a call. How coaching works. Who gets accepted. What happens next. Watch it, then come back and apply.",
      gateCta: "Take me to the video",
    },
    proof: {
      enabled: true,
      items: [
        { id: "p1", value: "1:1", label: "Real human coach" },
        { id: "p2", value: "Weekly", label: "reviews by Kane" },
        { id: "p3", value: "24h", label: "application response" },
        { id: "p4", value: "Limited", label: "Pro and Elite places" },
      ],
    },
    problem: {
      enabled: true,
      eyebrow: "The gap",
      title: "Plans don't fail. Follow-through does.",
      body: "Most people don't need another PDF. They need a coach who sees the week, adjusts the work, and keeps the standard high when motivation dips.",
    },
    howItWorks: {
      enabled: true,
      heading: "How it works",
      subhead: "No checkout for Pro or Elite. Qualify, book, talk to Kane.",
      steps: [
        {
          id: "s1",
          title: "Apply in minutes",
          body: "Ten questions. We learn your goal, schedule, and what's blocked results before.",
        },
        {
          id: "s2",
          title: "Book the call",
          body: "If you qualify, pick a time. Pro is 20 minutes. Elite is 30. Kane is briefed before you join.",
        },
        {
          id: "s3",
          title: "Get your programme",
          body: "If it's a fit, your coaching starts with a plan written for you — not the group average.",
        },
      ],
    },
    tiersSection: {
      heading: "Choose your level",
      subhead:
        "Start with the Challenge, or apply for Pro and Elite. Booking only for the one-to-one tiers — no price shown here.",
    },
    faq: {
      enabled: true,
      heading: "Questions before you apply",
      items: [
        {
          id: "f1",
          question: "Why can't I just buy Pro or Elite online?",
          answer:
            "These tiers are limited and built around you. The call is how Kane confirms fit, capacity, and the right programme — not a checkout form.",
        },
        {
          id: "f2",
          question: "What if I don't qualify?",
          answer:
            "You'll be pointed to the 8-Week Performance Challenge. It's self-serve, coached, and the right place to build consistency first.",
        },
        {
          id: "f3",
          question: "How fast will I hear back?",
          answer:
            "Kane reviews every application personally. You'll hear back within 24 hours.",
        },
        {
          id: "f4",
          question: "Is there a price on this page?",
          answer:
            "Not for Pro or Elite. Investment is confirmed inside the application so the public page stays focused on fit, not checkout.",
        },
      ],
    },
    finalCta: {
      enabled: true,
      title: "Ready for a programme that doesn't leave you alone with it?",
      body: "Apply for Pro or Elite. If you're not there yet, the Challenge is live and ready.",
      primary: { label: "Apply for Pro coaching", href: "/book?tier=pro" },
      secondary: { label: "Join the Challenge", href: "/challenge" },
    },
    testimonials: {
      enabled: true,
      heading: "Real clients. Real weeks of coaching.",
      subhead: "Replace these with your photos and quotes in Admin — Home / Media.",
      items: [
        {
          id: "t1",
          enabled: true,
          quote:
            "I'd been collecting plans for years. Having Kane review the week is what made it stick.",
          name: "Alex",
          result: "Finally consistent",
          imageUrl: "",
          imageAlt: "Alex training",
        },
        {
          id: "t2",
          enabled: true,
          quote:
            "The weekly check-ins kept me on track when I wanted to quit. Best investment I've made.",
          name: "Sam",
          result: "Weekly reviews",
          imageUrl: "",
          imageAlt: "Sam training",
        },
        {
          id: "t3",
          enabled: true,
          quote:
            "I only had a small window in the week. The programme was built around my life, not the other way around.",
          name: "Jordan",
          result: "Plan built around life",
          imageUrl: "",
          imageAlt: "Jordan training",
        },
      ],
    },
    disclaimer: {
      enabled: true,
      text: "Results vary. Pro and Elite are by application only — never sold at checkout. The 8-Week Challenge is the only self-serve option.",
    },
    popups: {
      email: {
        enabled: true,
        delayMs: 18000,
        title: "Get the coaching brief",
        body: "Early access, programme notes, and when Pro or Elite places open. Plain email. Unsubscribe anytime.",
        placeholder: "Email",
        cta: "Send it to me",
        success: "You're on the list. Watch for Kane in your inbox.",
        privacy: "We never sell your email. Used only for Formula Performance updates.",
      },
      reviews: {
        enabled: true,
        delayMs: 28000,
        title: "What clients say after a few coached weeks",
        ctaLabel: "Apply for Pro",
        ctaHref: "/book?tier=pro",
      },
    },
    stickyCta: {
      enabled: true,
      label: "Apply now",
      href: "#vsl",
    },
    imageSections: [
      {
        id: "results-banner",
        enabled: false,
        slot: "after-problem",
        heading: "What coached weeks look like",
        subhead: "Upload your own banner images — they stay on this site under /assets.",
        layout: "full",
        images: [
          {
            id: "results-1",
            enabled: true,
            url: "",
            alt: "Training results banner",
            caption: "",
            cta: { label: "Book Your Call", href: "/book?tier=pro" },
          },
        ],
      },
      {
        id: "social-proof-grid",
        enabled: false,
        slot: "after-tiers",
        heading: "Inside the work",
        subhead: "A second image section — grid layout for multiple banners.",
        layout: "grid",
        images: [
          {
            id: "grid-1",
            enabled: true,
            url: "",
            alt: "Session still 1",
            caption: "",
            cta: { label: "", href: "" },
          },
          {
            id: "grid-2",
            enabled: true,
            url: "",
            alt: "Session still 2",
            caption: "",
            cta: { label: "", href: "" },
          },
        ],
      },
    ],
    videoSections: [
      {
        id: "coach-intro",
        enabled: false,
        slot: "after-how",
        heading: "Hear it from Kane",
        subhead: "Videos play here — YouTube embeds stay on this page.",
        videos: [
          {
            id: "intro-1",
            enabled: true,
            title: "How Pro coaching works",
            body: "Paste a YouTube link in Admin. Click play to watch without leaving the site.",
            youtubeUrl: "",
            thumbnailUrl: "",
          },
        ],
      },
      {
        id: "client-stories",
        enabled: false,
        slot: "before-faq",
        heading: "Client stories",
        subhead: "A second video section for testimonials or programme walkthroughs.",
        videos: [
          {
            id: "story-1",
            enabled: true,
            title: "Story one",
            body: "",
            youtubeUrl: "",
            thumbnailUrl: "",
          },
        ],
      },
    ],
  },
  tiers: [
    {
      id: "entry",
      enabled: false,
      highlight: false,
      name: "Starter",
      badge: "",
      subhead: "Self-serve",
      body: [
        "A lighter way in.",
        "Build the habit first.",
        "Step up when you are ready.",
      ],
      includes: ["Guided plan", "Community access"],
      cta: { kind: "link", label: "Learn more", href: "/challenge" },
      applyBadge: "",
    },
    {
      id: "challenge",
      enabled: true,
      highlight: false,
      name: "The 8-Week Performance Challenge",
      badge: "Live",
      subhead: "Self-serve · Already built",
      body: [
        "Eight weeks. Five days a week.",
        "A coach tracking you the whole way.",
        "You are not left alone with it.",
      ],
      includes: [
        "One-to-one coach",
        "Coach tracking and check-ins",
        "Food tracking and nutrition advice",
        "Community group access",
        "Leaderboard incentive challenge",
      ],
      cta: {
        kind: "checkout",
        label: "Join the Challenge",
        href: "/challenge#checkout",
      },
      applyBadge: "",
    },
    {
      id: "pro",
      enabled: true,
      highlight: true,
      name: "Pro",
      badge: "",
      subhead: "Booking only",
      body: [
        "Your programme, written for you.",
        "Kane reviews and adjusts it weekly.",
        "Closer contact. Faster answers.",
        "Places are limited.",
      ],
      includes: [
        "Everything in the Challenge",
        "Bespoke programme, not the group plan",
        "Weekly review by Kane",
        "Direct line to Kane and the team",
        "Nutrition targets set and adjusted for you",
      ],
      cta: { kind: "book", label: "Book Your Call", bookTier: "pro" },
      applyBadge: "Apply",
    },
    {
      id: "elite",
      enabled: true,
      highlight: true,
      name: "Elite",
      badge: "",
      subhead: "Booking only",
      body: [
        "Kane and the performance team, in your corner.",
        "Fully bespoke. Built for you.",
        "Single-figure intake.",
        "By application.",
      ],
      includes: [
        "Everything in Pro",
        "Built with Kane personally",
        "Unannounced check-ins from Kane",
        "Video form review",
        "Priority access, first response",
      ],
      cta: { kind: "book", label: "Book Your Call", bookTier: "elite" },
      applyBadge: "Apply",
    },
  ],
  questionnaire: {
    back: { label: "← Back to programmes", href: "/#tiers" },
    title: "Book your call",
    introMobile:
      "One question at a time on smaller screens. Kane reviews every application personally.",
    introDesktop:
      "Fill everything on one page. Kane reviews every application personally.",
    progressLabel: "Question {current} of {total}",
    goals: [
      "fat loss",
      "strength",
      "physique",
      "performance",
      "general health",
    ],
    trainingNow: ["None", "1–2 days", "3–4 days", "5+ days"],
    daysCommit: ["1", "2", "3", "4", "5+"],
    investment: ["Yes", "I'd like to know more", "No"],
    fieldLabels: {
      name: "Name",
      email: "Email",
      mobile: "Mobile",
      instagram: "Instagram handle",
      medical: "Any injuries, medical conditions or medication?",
      stoppedResults: "What has stopped you getting results before?",
      whyNow: "Why now?",
      structuredProgramme:
        "Have you followed a structured programme before? What happened?",
    },
    placeholders: {
      instagram: "@yourhandle",
      medical: 'Type "None" if nothing applies',
    },
    stepTitles: [
      "1. Your details",
      "2. Main goal",
      "3. How are you training now?",
      "4. How many days a week can you commit?",
      "5. Any injuries, medical conditions or medication?",
      "6. What has stopped you getting results before?",
      "7. Why now?",
      "8. Have you followed a structured programme before? What happened?",
      "9. Investment confirmation",
      "10. Consent",
    ],
    step6Helper: "Kane opens the call with this — be specific.",
    step9Prompt:
      "This tier starts at {price} per month. Are you comfortable at that level?",
    medicalPrivacy:
      "Health information you share here is stored securely on our CRM, used only to brief your coach before a call, and never sold. You can ask us to delete it at any time.",
    consentLabel:
      "I agree to the privacy policy and consent to {tier} application data (including health answers) being stored so Kane can review my application.",
    consentWhatsappNote:
      "WhatsApp opt-in is asked separately after you book — never bundled with this consent.",
    buttons: {
      back: "Back",
      continue: "Continue",
      submit: "Submit application",
      submitting: "Submitting…",
    },
  },
  challenge: {
    title: "The 8-Week Performance Challenge",
    body: "Eight weeks. Five days a week. A coach tracking you the whole way. You are not left alone with it.",
    cta: { label: "Join the Challenge", href: "#checkout" },
    checkoutHeading: "Secure checkout",
    checkoutBody:
      "Join the 8-Week Performance Challenge now. This is the only self-serve checkout — Pro and Elite are by application only.",
    disqualifyEyebrow: "Better fit",
    disqualifyReasons: {
      commitment:
        "The one-to-one tiers need a minimum of three sessions a week to work, and the Challenge does the job without the call.",
      investment:
        "The one-to-one tiers are a different level of investment. The Challenge is the right place to start — no call needed.",
      both: "The one-to-one tiers need at least three sessions a week and a different investment level. The Challenge does the job without the call.",
    },
  },
  calendar: {
    title: "Pick a time with Kane",
    subhead:
      "{duration}-minute call · event type set from your {tier} application.",
    proEventLabel: "Pro Call — 20 min",
    eliteEventLabel: "Elite Call — 30 min",
    missingTitle: "Calendar embed URL not configured yet",
    missingBody:
      "Platform: {platform}. Add the Pro/Elite embed URLs on the Integrations page.",
    bookedContinue: "I've booked my slot — continue",
    devContinue: "Continue to confirmation (dev)",
  },
  confirmation: {
    eyebrow: "Application received",
    title: "You're on the list",
    body: "Kane reviews every application personally. You'll hear back within 24 hours.",
    whatsappLabel:
      "Message me on WhatsApp about this application and call reminders. This is separate from the privacy consent you already gave.",
    save: "Save preference",
    saving: "Saving…",
    saved: "Preference saved.",
  },
};
