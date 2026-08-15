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
      logoUrl: "/logo.png",
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
      portraitUrl: "",
      portraitAlt: "Kane, founder of The Formula Performance",
    },
    vsl: {
      enabled: true,
      stepLabel: "Step 1",
      heading: "Watch this video to see if you qualify",
      helper:
        "The application asks if you watched the whole video. It covers how Pro and Elite work, who gets in, and what happens after you apply. Skip it and the application will not make sense.",
      youtubeUrl: "https://www.youtube.com/watch?v=OCZ8WztqIOw",
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
    credentials: {
      enabled: true,
      eyebrow: "Who’s in your corner",
      heading: "Coached by someone who’s been in the fight.",
      body: "I fought pro MMA in Bellator, then spent 20+ years coaching. I founded The Formula and built the accountability system behind it myself.",
      items: [
        { id: "c1", value: "Ex-pro", label: "MMA fighter" },
        { id: "c2", value: "Bellator", label: "On the big stage" },
        { id: "c3", value: "20+", label: "Years coaching" },
        { id: "c4", value: "132K", label: "Following" },
      ],
    },
    whatsappCoach: {
      enabled: true,
      eyebrow: "How it works",
      heading: "Your Performance Coach, inside WhatsApp",
      body: "One number to save. For eight weeks it's how you train, eat and stay on track, all in the app you already have open.",
      steps: [
        {
          id: "w1",
          title: "It messages you first",
          body: "Your coach opens the conversation, most days before you’ve had your coffee.",
        },
        {
          id: "w2",
          title: "Ask it literally anything",
          body: "Stuck on a lift, tempted by a takeaway, unsure what to swap dinner for: ask and get a straight answer in seconds.",
        },
        {
          id: "w3",
          title: "It moves with your week",
          body: "Train four days instead of five, sleep badly, travel for work: your targets shift to match.",
        },
        {
          id: "w4",
          title: "There’s nowhere to hide",
          body: "Skip a session and it’s flagged the same day. No shame, just a nudge back on track.",
        },
      ],
      chatName: "Kane",
      chatTime: "Today",
      chatMessage:
        "Morning. Session is locked for 6. If the week runs long, we drop accessory work first — not the main lift. Message me before you skip.",
    },
    benchmarks: {
      enabled: true,
      eyebrow: "Measured, not guessed",
      heading: "What eight weeks actually changes.",
      body: "We test four benchmarks in week one and re-test them in week eight, from your own starting point.",
      items: [
        { id: "b1", value: "01", label: "Strength" },
        { id: "b2", value: "02", label: "Conditioning" },
        { id: "b3", value: "03", label: "Body composition" },
        { id: "b4", value: "04", label: "Work capacity" },
      ],
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
      offer: {
        enabled: true,
        anchorPrice: "",
        livePrice: "",
        addonLabel: "Complete Stack",
        addonValue: "",
        addonPrice: "",
        totalSaving: "",
        recurringTerms: "",
        offerEnd: "",
        placesRemaining: "",
      },
      guarantee: {
        enabled: true,
        guarantee: "14-day money-back guarantee",
        trustLine: "Secure checkout, cancel anytime",
      },
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
      heading: "Results of accountability.",
      subhead: "",
      items: [
        {
          id: "t1",
          enabled: true,
          quote:
            "Taking The Complete Stack and being held accountable got me the results I wanted.",
          name: "Mustafa S.",
          result: "",
          imageUrl: "",
          beforeImageUrl: "",
          imageAlt: "Mustafa S.",
        },
        {
          id: "t2",
          enabled: true,
          quote:
            "The Formula system improved my ability to push myself harder.",
          name: "Casey B.",
          result: "",
          imageUrl: "",
          beforeImageUrl: "",
          imageAlt: "Casey B.",
        },
        {
          id: "t3",
          enabled: true,
          quote:
            "Kane set the tone and the standard. I followed it and got the results.",
          name: "Mustafa R.",
          result: "",
          imageUrl: "",
          beforeImageUrl: "",
          imageAlt: "Mustafa R.",
        },
        {
          id: "t4",
          enabled: true,
          quote:
            "Following The Formula training system made me realise I could lose the weight I never thought I could with this programme.",
          name: "Ben K.",
          result: "",
          imageUrl: "",
          beforeImageUrl: "",
          imageAlt: "Ben K.",
        },
        {
          id: "t5",
          enabled: true,
          quote:
            "Kane held me accountable every step of the way. Now I don't need him because the discipline is built.",
          name: "Jamie H.",
          result: "",
          imageUrl: "",
          beforeImageUrl: "",
          imageAlt: "Jamie H.",
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
      label: "Apply for Pro",
      href: "/book?tier=pro",
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
    missingTitle: "Calendar is not connected yet",
    missingBody:
      "Platform: {platform}. In Admin → Integrations, add Google Calendar or Calendly API credentials (or a fallback embed URL).",
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
