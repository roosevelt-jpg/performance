import { DEFAULT_FUNNEL } from "@/lib/funnel/defaults";
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
      title: "The Formula Performance | You Need Follow-Through",
      description:
        "You don't need another training plan. Personalised performance coaching with Kane — accountability, consistency, and proof it worked. Two-minute application. No obligation.",
      keywords:
        "performance coaching, follow-through, accountability coaching, Kane Mousah, The Formula Performance, 8 week transformation, online fitness coaching",
      ogImageUrl: "/logo.png",
    },
  },
  chrome: {
    headerLogoHref: "/",
    nav: [
      {
        id: "compare",
        label: "Compare programmes",
        href: "/#tiers",
        visible: true,
      },
      {
        id: "video",
        label: "Watch the video",
        href: "/#vsl",
        visible: true,
      },
      {
        id: "apply",
        label: "See If You're a Fit",
        href: "/book?tier=pro",
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
        id: "apply",
        label: "See If You're a Fit",
        href: "/book?tier=pro",
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
      eyebrow: "1:1 coaching with Kane",
      headline: "You don't need another training plan. You need follow-through.",
      body: "Personalised performance coaching with Kane, built around your life, your goals and the standard you want to hold yourself to.",
      cta: { label: "See If You're a Fit", href: "/book?tier=pro" },
      ctaNote: "2-minute application · No obligation",
      secondaryCta: { label: "Watch the video", href: "#vsl" },
      mediaType: "none",
      mediaUrl: "",
      mediaPoster: "",
      mediaAlt: "Athletes training with The Formula Performance",
      portraitUrl: "/assets/kane-hero.png",
      portraitAlt: "Kane Mousah, former professional Bellator fighter and founder of The Formula",
    },
    vsl: {
      enabled: true,
      stepLabel: "Watch first",
      heading: "Hear it from Kane.",
      helper:
        "Why most people fail, why accountability matters, and who he actually works with.",
      youtubeUrl: "https://www.youtube.com/watch?v=OCZ8WztqIOw",
      thumbnailUrl: "",
      muteHint: "Tap to unmute",
      applyStepLabel: "Step 2",
      applyCta: { label: "See If You're a Fit", href: "/book?tier=pro" },
      applyNote: "2-minute application · No obligation",
      requireWatch: true,
      gateTitle: "Watch the video first.",
      gateBody:
        "Kane covers why people stall, what he expects, and whether this is actually for you. Watch it, then apply.",
      gateCta: "Take me to the video",
    },
    proof: {
      enabled: true,
      items: [
        { id: "p1", value: "", label: "Clients coached" },
        { id: "p2", value: "", label: "Weight lost" },
        { id: "p3", value: "", label: "Muscle gained" },
        { id: "p4", value: "", label: "Real human coach" },
      ],
    },
    problem: {
      enabled: true,
      eyebrow: "The gap",
      title: "Plans don't fail. Follow-through does.",
      body: "You probably don't need more information. You know how to train and what you should be eating. The problem is doing it consistently when work gets busy, motivation disappears and life gets in the way.",
    },
    credentials: {
      enabled: true,
      eyebrow: "Why Kane",
      heading: "Why trust him with this.",
      body: "Kane has spent decades understanding what makes people perform — and what makes them quit. Ex-pro MMA. Bellator. 20+ years coaching. 132K watching. The standard is his; the follow-through is yours.",
      imageUrl: "/assets/kane-coach.jpg",
      imageAlt: "Kane Mousah at a Bellator weigh-in",
      caption: "Ex-pro MMA · Founder, The Formula",
      followerCount: "132K",
      followerHref: "https://instagram.com/kanem14",
      items: [
        { id: "c1", value: "Ex-pro", label: "MMA fighter" },
        { id: "c2", value: "Bellator", label: "On the big stage" },
        { id: "c3", value: "20+", label: "Years coaching" },
        { id: "c4", value: "132K", label: "Audience" },
      ],
    },
    whatsappCoach: {
      enabled: true,
      eyebrow: "Always on",
      heading: "Your coach, in your pocket.",
      body: "The technology isn't your coach. It makes sure your coaching doesn't disappear when life gets busy. The strongest part: it messages you first.",
      steps: [
        {
          id: "w1",
          title: "It messages you first",
          body: "The coach doesn't wait for you to check in. When motivation disappears, the system still reaches you.",
        },
        {
          id: "w2",
          title: "Ask it anything",
          body: "Stuck on a lift, tempted by a takeaway, unsure what to swap: you get a straight answer in seconds.",
        },
        {
          id: "w3",
          title: "The week gets rewritten",
          body: "Travel, missed sessions, poor sleep, busy weeks — the plan adapts instead of falling apart.",
        },
        {
          id: "w4",
          title: "There's nowhere to hide",
          body: "Skip a session and it's flagged the same day. Not shame. A nudge back to the standard.",
        },
      ],
      chatName: "Kane · Your Coach",
      chatTime: "Today",
      avatarUrl: "/assets/kane-headshot.png",
      chatMessage:
        "Morning. Session is locked for 6. If the week runs long, we drop accessory work first — not the main lift. Message me before you skip.",
    },
    benchmarks: {
      enabled: true,
      eyebrow: "The 8-week transformation",
      heading: "You'll know exactly what changed.",
      body: "Week 1: we establish your baseline using four performance benchmarks. Weeks 2–7: train, adapt, execute. Week 8: we test again.",
      items: [
        { id: "b1", value: "01", label: "Strength" },
        { id: "b2", value: "02", label: "Conditioning" },
        { id: "b3", value: "03", label: "Body composition" },
        { id: "b4", value: "04", label: "Work capacity" },
      ],
    },
    howItWorks: {
      enabled: true,
      heading: "The core system",
      subhead:
        "This isn't another plan. It's the mechanism that keeps you consistent when life gets busy.",
      steps: [
        {
          id: "s1",
          title: "01 — Personalised Training",
          body: "Training built around your goals, ability, schedule and starting point.",
        },
        {
          id: "s2",
          title: "02 — Daily Accountability",
          body: "The coach doesn't wait for you to check in. The system keeps you accountable when motivation disappears.",
        },
        {
          id: "s3",
          title: "03 — Real-Time Coaching",
          body: "Travel, missed sessions, poor sleep and busy weeks are handled through adaptation rather than letting the plan fall apart.",
        },
      ],
    },
    tiersSection: {
      enabled: true,
      heading: "What you actually get",
      subhead:
        "Personalised training, nutrition, daily accountability and coaching that adapts with the week. Pro and Elite are by application — no public prices.",
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
      heading: "Before you apply",
      items: [
        {
          id: "f1",
          question: "Do I need to be experienced?",
          answer:
            "No. You need to be serious. Kane coaches from your starting point — what matters is that you'll train and take the standard.",
        },
        {
          id: "f2",
          question: "How much time do I need?",
          answer:
            "At least three sessions a week. If you can't commit to that, this isn't for you yet — the 8-Week Challenge is the better first step.",
        },
        {
          id: "f3",
          question: "What if I miss a session?",
          answer:
            "You say so. The plan adapts instead of collapsing. Skip without a word and it gets flagged the same day.",
        },
        {
          id: "f4",
          question: "Is this personalised?",
          answer:
            "Yes. Training, nutrition and the week's adjustments are built around your goals, ability, schedule and starting point — not a group template.",
        },
        {
          id: "f5",
          question: "How does WhatsApp coaching work?",
          answer:
            "It messages you first. You can ask anything, and the week gets rewritten when life gets busy. You are not paying for a bot. The technology makes the coaching persistent.",
        },
        {
          id: "f6",
          question: "What happens after the 8 weeks?",
          answer:
            "We re-test the same four benchmarks you started with, so you know exactly what changed. If it's working and you want to stay on, Kane reviews that on the call — not on this page.",
        },
      ],
    },
    finalCta: {
      enabled: true,
      title: "Stop starting over.",
      body: "If you're ready to train consistently, be held accountable and find out what you're actually capable of, apply to work with Kane. Applications are reviewed individually.",
      primary: { label: "See If You're a Fit", href: "/book?tier=pro" },
      secondary: { label: "Join the Challenge", href: "/challenge" },
    },
    testimonials: {
      enabled: true,
      heading: "People like you. Results like this.",
      subhead: "Before → process → after. Not a wall of generic praise.",
      items: [
        {
          id: "t1",
          enabled: true,
          quote:
            "Taking The Complete Stack and being held accountable got me the results I wanted.",
          name: "Mustafa S.",
          result: "Accountability, then the result.",
          imageUrl: "/assets/transformations/mustafa-s.jpg",
          beforeImageUrl: "",
          imageAlt: "Mustafa S. before and after",
        },
        {
          id: "t2",
          enabled: true,
          quote:
            "The Formula system improved my ability to push myself harder.",
          name: "Casey B.",
          result: "The standard, then the output.",
          imageUrl: "/assets/transformations/casey.jpg",
          beforeImageUrl: "",
          imageAlt: "Casey B. before and after",
        },
        {
          id: "t3",
          enabled: true,
          quote:
            "Kane set the tone and the standard. I followed it and got the results.",
          name: "Mustafa R.",
          result: "Kane's standard. Their follow-through.",
          imageUrl: "/assets/transformations/mustafa-r.jpg",
          beforeImageUrl: "",
          imageAlt: "Mustafa R. before and after",
        },
        {
          id: "t4",
          enabled: true,
          quote:
            "Following The Formula training system made me realise I could lose the weight I never thought I could with this programme.",
          name: "Ben K.",
          result: "A plan they actually finished.",
          imageUrl: "/assets/transformations/ben.jpg",
          beforeImageUrl: "",
          imageAlt: "Ben K. before and after",
        },
        {
          id: "t5",
          enabled: false,
          quote:
            "Kane held me accountable every step of the way. Now I don't need him because the discipline is built.",
          name: "Jamie H.",
          result: "Discipline that stayed.",
          imageUrl: "/assets/transformations/jamie.jpg",
          beforeImageUrl: "",
          imageAlt: "Jamie H. before and after",
        },
      ],
    },
    disclaimer: {
      enabled: true,
      text: "Results vary. This is for serious people who will train at least three days a week and be held accountable. Pro and Elite are by application only — never sold at checkout. The 8-Week Challenge is the only self-serve option.",
    },
    popups: {
      email: {
        enabled: false,
        delayMs: 18000,
        title: "Get the coaching brief",
        body: "Notes on follow-through, and when places open. Plain email. Unsubscribe anytime.",
        placeholder: "Email",
        cta: "Send it to me",
        success: "You're on the list. Watch for Kane in your inbox.",
        privacy: "We never sell your email. Used only for Formula Performance updates.",
      },
      reviews: {
        enabled: false,
        delayMs: 28000,
        title: "What clients say after a few coached weeks",
        ctaLabel: "See If You're a Fit",
        ctaHref: "/book?tier=pro",
      },
    },
    stickyCta: {
      enabled: true,
      label: "See If You're a Fit",
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
            cta: { label: "See If You're a Fit", href: "/book?tier=pro" },
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
            title: "How Kane coaches",
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
        "You'll know exactly what changed.",
        "Week 1 baseline. Week 8 re-test.",
        "A coach tracking you the whole way.",
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
        "Daily accountability that doesn't wait for you to check in.",
        "Real-time adjustments when the week changes.",
        "Places are limited. By application.",
      ],
      includes: [
        "Personalised training",
        "Nutrition guidance",
        "Daily accountability",
        "Direct coaching",
        "Real-time programme adjustments",
        "Performance testing",
        "Week 1 → Week 8 progress tracking",
      ],
      cta: { kind: "book", label: "See If You're a Fit", bookTier: "pro" },
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
        "Closer contact when the week gets messy",
        "Video form review",
        "Priority access, first response",
      ],
      cta: { kind: "book", label: "See If You're a Fit", bookTier: "elite" },
      applyBadge: "Apply",
    },
  ],
  questionnaire: {
    back: { label: "← Back", href: "/" },
    title: "Application",
    introMobile:
      "Two minutes. Kane reviews every application himself.",
    introDesktop:
      "Kane reviews every application himself. Chat is the default path — this form is the fallback.",
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
    body: "You'll know exactly what changed. Week 1 is your baseline. Weeks 2–7 you train, adapt and execute. Week 8 we test again. You are not left alone with it.",
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
    body: "Kane reviews every application himself. You'll hear back within 24 hours.",
    whatsappLabel:
      "Message me on WhatsApp about this application and call reminders. This is separate from the privacy consent you already gave.",
    save: "Save preference",
    saving: "Saving…",
    saved: "Preference saved.",
  },
  funnel: DEFAULT_FUNNEL,
};
