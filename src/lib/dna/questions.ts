import type { CmsDna, DnaGates, DnaQuestion } from "./types";
import { DNA_WEIGHTS } from "./weights";

export const DNA_CATEGORY_LABELS = {
  journey: "Journey",
  training: "Training",
  nutrition: "Nutrition",
  routine: "Routine",
  health: "Health",
  mindset: "Mindset",
} as const;

export const DEFAULT_DNA_GATES: DnaGates = {
  callMinOverall: 72,
  callMinTraining: 60,
  callMinMindset: 55,
  challengeMinOverall: 40,
  challengeMinTraining: 40,
  challengeMinNutrition: 50,
};


export const DNA_QUESTIONS: DnaQuestion[] = [
  {
    id: "j1",
    category: "journey",
    title: "Where are you on this journey right now?",
    options: [
      { id: "a", label: "I train consistently and want a higher standard", score: 3 },
      { id: "b", label: "I start well, then drop off when life gets busy", score: 2 },
      { id: "c", label: "I've stopped completely and want back in", score: 1 },
      { id: "d", label: "I've never had a real structure", score: 0 },
    ],
  },
  {
    id: "j2",
    category: "journey",
    title: "What usually ends the run?",
    options: [
      { id: "a", label: "I don't stop — I adapt the week", score: 3 },
      { id: "b", label: "Work, travel or family weeks", score: 2 },
      { id: "c", label: "Motivation disappearing", score: 1 },
      { id: "d", label: "I never really started", score: 0 },
    ],
  },
  {
    id: "t1",
    category: "training",
    title: "How many real training sessions do you complete most weeks?",
    options: [
      { id: "a", label: "Five or more", score: 3 },
      { id: "b", label: "Three to four", score: 2 },
      { id: "c", label: "One or two", score: 1, flags: ["low_frequency"] },
      { id: "d", label: "None I can count on", score: 0, flags: ["low_frequency"] },
    ],
  },
  {
    id: "t2",
    category: "training",
    title: "When a session is planned and the day goes sideways, you…",
    options: [
      { id: "a", label: "Shorten it and still train", score: 3 },
      { id: "b", label: "Move it to tomorrow", score: 2 },
      { id: "c", label: "Skip and hope next week is better", score: 1 },
      { id: "d", label: "Let the whole week go", score: 0 },
    ],
  },
  {
    id: "n1",
    category: "nutrition",
    title: "How do you eat across a normal week?",
    options: [
      { id: "a", label: "Protein, portions and a plan I actually follow", score: 3 },
      { id: "b", label: "Good most days, messy on weekends", score: 2 },
      { id: "c", label: "I know what to do. I don't do it", score: 1, flags: ["nutrition_leak"] },
      { id: "d", label: "No structure at all", score: 0, flags: ["nutrition_leak"] },
    ],
  },
  {
    id: "n2",
    category: "nutrition",
    title: "When you're tired or tempted, what happens?",
    options: [
      { id: "a", label: "I still hit the important bits", score: 3 },
      { id: "b", label: "I negotiate — one slip, then back on", score: 2 },
      { id: "c", label: "The day is written off", score: 1 },
      { id: "d", label: "The week is written off", score: 0 },
    ],
  },
  {
    id: "r1",
    category: "routine",
    title: "Does training have a fixed place in your week?",
    options: [
      { id: "a", label: "Yes — days and times are locked", score: 3 },
      { id: "b", label: "Roughly — I fit it in", score: 2 },
      { id: "c", label: "Only when I feel like it", score: 1, flags: ["no_slot"] },
      { id: "d", label: "Not at all", score: 0, flags: ["no_slot"] },
    ],
  },
  {
    id: "r2",
    category: "routine",
    title: "How predictable is your sleep and work rhythm?",
    options: [
      { id: "a", label: "Stable enough to train around", score: 3 },
      { id: "b", label: "Busy but manageable", score: 2 },
      { id: "c", label: "Chaotic most weeks", score: 1 },
      { id: "d", label: "I don't have a rhythm to protect", score: 0 },
    ],
  },
  {
    id: "h1",
    category: "health",
    title: "How do you feel most days — energy, aches, recovery?",
    options: [
      { id: "a", label: "Ready to train, recovering well", score: 3 },
      { id: "b", label: "A bit run down, still capable", score: 2 },
      { id: "c", label: "Tired, sore, or both", score: 1 },
      { id: "d", label: "Something's off and I'm guessing why", score: 0 },
    ],
  },
  {
    id: "h2",
    category: "health",
    title: "Sleep most nights?",
    options: [
      { id: "a", label: "Seven-plus hours, fairly consistent", score: 3 },
      { id: "b", label: "Enough, not great", score: 2 },
      { id: "c", label: "Short or broken", score: 1 },
      { id: "d", label: "I don't track it and it shows", score: 0 },
    ],
  },
  {
    id: "m1",
    category: "mindset",
    title: "Who holds you to the standard when motivation drops?",
    options: [
      { id: "a", label: "A coach, and it works", score: 3 },
      { id: "b", label: "Me — some weeks", score: 2 },
      { id: "c", label: "Nobody. That's the gap", score: 1 },
      { id: "d", label: "I don't want to be held accountable yet", score: 0, flags: ["no_accountability"] },
    ],
  },
  {
    id: "m2",
    category: "mindset",
    title: "If Kane's team took this on, how ready are you to be coached?",
    options: [
      { id: "a", label: "Ready now. I want the standard", score: 3 },
      { id: "b", label: "Ready if the fit is right", score: 2 },
      { id: "c", label: "Curious — not committed yet", score: 1, flags: ["uncommitted"] },
      { id: "d", label: "Just looking", score: 0, flags: ["looking"] },
    ],
  },
];

export const DEFAULT_DNA: CmsDna = {
  enabled: true,
  eyebrow: "Performance DNA",
  heading: "Find out exactly where follow-through is leaking.",
  body: "Two minutes. Training, nutrition, routine, health and mindset — then a score, a next step, and a coach from Kane's team. The report lands on WhatsApp and email.",
  ctaLabel: "Run your Performance DNA",
  href: "/dna",
  resultHeading: "Your Performance DNA",
  sendingNote:
    "We'll send the full PDF to your WhatsApp and email as soon as those channels are connected.",
  coaches: [
    {
      id: "kane",
      name: "Kane Mousah",
      role: "Head coach · 1:1",
      forPath: "call",
    },
    {
      id: "team",
      name: "Kane's performance team",
      role: "8-Week Challenge coach",
      forPath: "challenge",
    },
    {
      id: "community",
      name: "The Formula community",
      role: "Free group standard",
      forPath: "group",
    },
  ],
  questions: DNA_QUESTIONS,
  weights: { ...DNA_WEIGHTS },
  gates: { ...DEFAULT_DNA_GATES },
};

