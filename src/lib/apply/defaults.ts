import type { CmsApplyFunnel } from "./types";

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
};

export const APPLY_QUESTIONS = [
  {
    id: "goal",
    title: "What are you trying to change?",
    multi: false,
    options: [
      "Lose fat",
      "Build muscle",
      "Get stronger and fitter",
      "Rebuild after a break or injury",
    ],
  },
  {
    id: "startingPoint",
    title: "Where are you starting from?",
    multi: false,
    options: [
      "I train consistently already",
      "I train on and off",
      "I have stopped completely",
      "I have never trained properly",
    ],
  },
  {
    id: "days",
    title: "Realistically, how many days a week can you train?",
    multi: false,
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
      "Staying consistent",
      "Not knowing what to do",
      "Nutrition",
      "Time",
      "Injury",
    ],
  },
  {
    id: "timeline",
    title: "How soon do you want to start?",
    multi: false,
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
    multi: false,
    options: ["Yes, I have one now", "Yes, in the past", "Never"],
  },
  {
    id: "investment",
    title:
      "Coaching with Kane directly starts in the hundreds per month. If we agree it is the right fit, what are you ready to put into getting this right?",
    multi: false,
    options: [
      { id: "1000_plus", label: "£1,000 or more" },
      { id: "500_1000", label: "£500 to £1,000" },
      { id: "150_500", label: "£150 to £500" },
      { id: "under_150", label: "Under £150 right now" },
    ],
  },
] as const;
