import type {
  ApplyQuestion,
  ApplyRouting,
  CmsApplyFunnel,
} from "./types";

export const DEFAULT_APPLY_ROUTING: ApplyRouting = {
  nurtureInvestmentIds: ["under_150"],
  nurtureTimelineIds: ["looking"],
  lowInvestmentIds: ["150_500"],
  highBudgetInvestmentIds: ["500_1000", "1000_plus"],
  lowDaysIds: ["under_two"],
  highProInvestmentIds: ["500_1000"],
  highEliteInvestmentIds: ["1000_plus"],
};

export const DEFAULT_APPLY_QUESTIONS: ApplyQuestion[] = [
  {
    id: "goal",
    title: "What are you trying to change?",
    options: [
      { id: "Lose fat", label: "Lose fat" },
      { id: "Build muscle", label: "Build muscle" },
      { id: "Get stronger and fitter", label: "Get stronger and fitter" },
      {
        id: "Rebuild after a break or injury",
        label: "Rebuild after a break or injury",
      },
    ],
  },
  {
    id: "startingPoint",
    title: "Where are you starting from?",
    options: [
      { id: "I train consistently already", label: "I train consistently already" },
      { id: "I train on and off", label: "I train on and off" },
      { id: "I have stopped completely", label: "I have stopped completely" },
      {
        id: "I have never trained properly",
        label: "I have never trained properly",
      },
    ],
  },
  {
    id: "days",
    title: "Realistically, how many days a week can you train?",
    options: [
      { id: "five_plus", label: "Five or more" },
      { id: "three_four", label: "Three to four" },
      { id: "two", label: "Two" },
      { id: "under_two", label: "Fewer than two" },
    ],
  },
  {
    id: "obstacles",
    title: "What has got in the way before? Choose any that apply.",
    multi: true,
    options: [
      { id: "Staying consistent", label: "Staying consistent" },
      { id: "Not knowing what to do", label: "Not knowing what to do" },
      { id: "Nutrition", label: "Nutrition" },
      { id: "Time", label: "Time" },
      { id: "Injury", label: "Injury" },
    ],
  },
  {
    id: "timeline",
    title: "How soon do you want to start?",
    options: [
      { id: "immediately", label: "Immediately" },
      { id: "two_weeks", label: "Within two weeks" },
      { id: "month", label: "Within a month" },
      { id: "looking", label: "Just looking for now" },
    ],
  },
  {
    id: "coachHistory",
    title: "Have you worked with a coach before?",
    options: [
      { id: "Yes, I have one now", label: "Yes, I have one now" },
      { id: "Yes, in the past", label: "Yes, in the past" },
      { id: "Never", label: "Never" },
    ],
  },
  {
    id: "investment",
    title:
      "Coaching with Kane directly starts in the hundreds per month. If we agree it is the right fit, what are you ready to put into getting this right?",
    options: [
      { id: "1000_plus", label: "£1,000 or more" },
      { id: "500_1000", label: "£500 to £1,000" },
      { id: "150_500", label: "£150 to £500" },
      { id: "under_150", label: "Under £150 right now" },
    ],
  },
];

export const DEFAULT_APPLY_FUNNEL: CmsApplyFunnel = {
  enabled: true,
  gateEnabled: true,
  watchPct: 60,
  nurtureUrl: "",
  gateHeadline: "Watch the full breakdown before you decide anything.",
  gateBody:
    "Kane explains how the coaching works, who it is for, and who it is not for. Enter your details and the video unlocks.",
  gateCta: "Unlock the video",
  vslCta: "See if you qualify",
  escapeHatchLabel: "Not ready for coaching? Join the free group.",
  progressLabel: "Application opens shortly",
  mobileTitle: "Last thing. Where should we reach you?",
  mobileBody: "Call confirmation or the group invite lands here.",
  mobileCta: "See your next step",
  high: {
    heading: "You qualify, {name}. Book your call.",
    body: "Kane reviews every application himself and will be briefed on your answers before you join. Pick a time that works. Twenty minutes, no pressure, and a straight answer either way on whether this is right for you.",
    primaryLabel: "Choose your time",
    primaryHref: "/book/calendar?tier=pro",
    secondaryLabel: "Run your Performance DNA",
    secondaryHref: "/dna",
  },
  low: {
    heading: "One-to-one is not the right move for you yet. This is.",
    body: "Based on your answers, the 8-Week Challenge is where you should start. It is the same training system and the same Performance Coach in WhatsApp, without the one-to-one price. Build eight weeks of consistency on it, and the one-to-one conversation becomes a very different one.",
    primaryLabel: "Start the 8-Week Challenge",
    primaryHref: "/challenge",
    secondaryLabel: "Join the free group instead",
    secondaryHref: "",
  },
  nurture: {
    heading: "Not the right time to pay for coaching. Come and train with us anyway.",
    body: "The free group is where a few thousand people train alongside each other. Sessions, questions answered, and the same standard Kane holds his paying clients to. No cost, no card, and no catch. When you are ready for more, you will already know how we work.",
    primaryLabel: "Join the group",
    primaryHref: "",
    secondaryLabel: "Run your Performance DNA",
    secondaryHref: "/dna",
  },
  questions: DEFAULT_APPLY_QUESTIONS,
  routing: DEFAULT_APPLY_ROUTING,
};

/** @deprecated use DEFAULT_APPLY_QUESTIONS / CMS applyFunnel.questions */
export const APPLY_QUESTIONS = DEFAULT_APPLY_QUESTIONS;
