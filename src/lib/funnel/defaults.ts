import type { CmsFunnel, CmsFunnelLayout, CmsFunnelStep } from "@/lib/cms/types";

export const DEFAULT_FUNNEL_LAYOUT: CmsFunnelLayout = {
  phoneMockup: false,
  vsl: true,
  proof: true,
  testimonials: true,
  credentials: true,
  problem: true,
  whatsappCoach: true,
  benchmarks: true,
  howItWorks: false,
  tiers: false,
  faq: true,
  finalCta: true,
};

export const DEFAULT_FUNNEL_STEPS: CmsFunnelStep[] = [
  {
    id: "ready",
    enabled: true,
    field: "message",
    coachText:
      "I'm Kane's coach on this chat. Two minutes, then we know if a call is next — or the 8-Week Challenge. Ready?",
    placeholder: "Let's go",
  },
  {
    id: "tier",
    enabled: true,
    field: "tier",
    coachText:
      "Pro is weekly 1:1 with Kane. Elite is closer contact. Which are you applying for?",
    placeholder: "",
  },
  {
    id: "name",
    enabled: true,
    field: "name",
    coachText: "What should I call you?",
    placeholder: "First name",
  },
  {
    id: "email",
    enabled: true,
    field: "email",
    coachText: "Best email for Kane's team, {name}?",
    placeholder: "you@email.com",
  },
  {
    id: "mobile",
    enabled: true,
    field: "mobile",
    coachText: "Mobile number — so we can confirm the call.",
    placeholder: "07…",
  },
  {
    id: "goal",
    enabled: true,
    field: "mainGoal",
    coachText: "What's the main goal?",
    placeholder: "",
  },
  {
    id: "days",
    enabled: true,
    field: "daysCommit",
    coachText: "How many days a week can you actually train?",
    placeholder: "",
  },
  {
    id: "invest",
    enabled: true,
    field: "investment",
    coachText:
      "{tier} starts at {price} a month. Are you in a position to invest at that level if Kane's the right fit?",
    placeholder: "",
  },
  {
    id: "privacy",
    enabled: true,
    field: "privacy",
    coachText:
      "Last step. Kane reviews every application himself. Tick to send yours.",
    placeholder: "Send application",
  },
];

export const DEFAULT_FUNNEL: CmsFunnel = {
  enabled: true,
  coachName: "Kane · Performance",
  avatarUrl: "/assets/kane-headshot.png",
  launcherLabel: "Apply in chat",
  greeting: "Watch the video first if you haven't. Then we'll see if Pro or Elite is a fit.",
  openOn: "cta",
  delayMs: 12000,
  defaultTier: "pro",
  startButton: "Start application",
  qualifiedMessage:
    "You're through. Pick a time with Kane — he's briefed from this chat before you join.",
  qualifiedCta: "Book the call",
  disqualifiedMessage:
    "Pro and Elite need at least three training days a week and a different investment. The 8-Week Challenge is the right next step — no call needed.",
  disqualifiedCta: "Join the Challenge",
  submittingText: "Sending this to Kane…",
  errorText: "Something went wrong. Try that again.",
  layout: DEFAULT_FUNNEL_LAYOUT,
  steps: DEFAULT_FUNNEL_STEPS,
};
