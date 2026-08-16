import type { DnaCategoryId } from "./types";

/** Pair key is the two option ids in question order, e.g. "ab". */
function pair(a: string, b: string): string {
  return `${a}${b}`;
}

const COPIES: Record<DnaCategoryId, Record<string, string>> = {
  journey: {
    aa: "You already have a run going. The job is a higher standard, not another restart.",
    ab: "Training is there. Life still knocks a week over. We plan the messy weeks, not just the easy ones.",
    ac: "You look consistent until motivation is the engine. Motivation is a terrible coach.",
    ad: "The current week works. The history says it used to not exist. We lock this one in.",
    ba: "You start well and you know how to adapt — drops happen on busy weeks. That's a system leak.",
    bb: "You start. Then work, travel or family ends it. This is follow-through, not knowledge.",
    bc: "Starts are easy. Staying is the product. That's why a coach exists.",
    bd: "You want it when it is new. There isn't a currently-working week to protect yet.",
    ca: "You've stopped, but you still know how to salvage a week. We use that — we don't rewind to zero.",
    cb: "The break happened because life won the diary. We put training back in the diary first.",
    cc: "Stopped, and motivation was the last thing holding it. External standard is the next thing.",
    cd: "You want back in, without a history of a real week. Challenge builds that week.",
    da: "No history of structure, but you already adapt. Rare. We give it a plan to live on.",
    db: "Never been structured, and life already competes. We start smaller than 1:1.",
    dc: "Never started properly and motivation is the plan. That plan fails. Group first.",
    dd: "There is no currently-working week. We build one before we talk 1:1.",
  },
  training: {
    aa: "Sessions happen and you still train when the day goes sideways. Kane can load this.",
    ab: "Volume is there. The leak is moving the session tomorrow. Tomorrows stack.",
    ac: "You train a lot until you skip. High volume with a skip switch is not 1:1-ready yet.",
    ad: "Five sessions means nothing if one bad day writes the week off. Fix the intercept.",
    ba: "Three to four sessions, and you shorten rather than vanish. That's a real training week.",
    bb: "You train enough to know it works — then you reshuffle. Lock the slot.",
    bc: "Three to four, dropped when the day breaks. The Challenge exists for this person.",
    bd: "You can train. You don't currently finish the week. That's the leak.",
    ca: "One or two sessions, even when you try to salvage. Not enough for 1:1 results.",
    cb: "One or two, and they move. Frequency first. Programme later.",
    cc: "The plan is not the issue. Completing sessions is. Challenge first.",
    cd: "Almost no sessions, and a miss ends the week. We do not sell 1:1 into that.",
    da: "No sessions you can count on — even the salvage instinct has nothing to salvage.",
    db: "None you can count on. Moving it to tomorrow is how the week stays empty.",
    dc: "Skipping is the habit. We install showing-up before we add load.",
    dd: "No training week exists. Group or Challenge — not a calendar with Kane.",
  },
  nutrition: {
    aa: "Eating is structured enough to support training. Keep the boring bits boring.",
    ab: "The plan holds until you negotiate. One slip is fine. A second one is the week.",
    ac: "Structure exists, then the day is written off. That's a rule, not a craving.",
    ad: "You can eat well. One miss becomes a week. We cut that rule.",
    ba: "Weekdays hold; weekends leak; you still hit the bits that matter. Close the weekend.",
    bb: "Good most days, mess on weekends, and you negotiate. Classic leak. Fixable in eight weeks.",
    bc: "Weekdays work. Temptation writes the day off. Food is losing to the evening.",
    bd: "Weekends already leak, then the week follows. Nutrition needs a coach, not another PDF.",
    ca: "You know what to do and you still hit the important bits when pressed. Knowledge isn't the gap — weeks are.",
    cb: "You know what to do. You negotiate it away. That's follow-through, same as training.",
    cc: "You know what to do and you don't do it, then the day is gone. Challenge locks this.",
    cd: "Knowing without doing, then the week is gone. Do not pay for 1:1 on that pattern yet.",
    da: "No structure, but you still protect something when tired. We give that a plan.",
    db: "No structure, plus negotiation. Start with protein and portions. That's the whole first job.",
    dc: "No structure, day written off. Food will kill the training block if we ignore it.",
    dd: "Training without food structure burns time. We lock protein and portions first.",
  },
  routine: {
    aa: "Days and times are locked, and the rest of life is stable enough. That's rarer than people admit.",
    ab: "The training slot is locked inside a busy week. We train around the chaos, not through hope.",
    ac: "You have a slot and the rest of life is chaos. Protect the slot like a meeting.",
    ad: "A locked session in a life with no rhythm still works — barely. We build the rhythm.",
    ba: "You fit training in, and the week is otherwise stable. Lock the hours so fit-in becomes show-up.",
    bb: "Roughly in the diary, busy but manageable. That's the Challenge customer.",
    bc: "Fitting it in during a chaotic week is how sessions disappear. Calendar first.",
    bd: "No rhythm, sessions opportunistically. We do not start at 1:1 intensity.",
    ca: "Only when you feel like it, even with a stable week. Feeling is not a programme.",
    cb: "Mood-based training in a busy week. That's why the week leaks.",
    cc: "Chaotic life plus mood-based training. Group standard, then Challenge.",
    cd: "Nothing in the diary currently wins. We put training on the calendar before intensity.",
    da: "No fixed place, even though the week could take one. That's a choice. We make it.",
    db: "No slot, busy week. The slot is the product.",
    dc: "No slot, chaotic week. Don't buy 1:1 to solve a diary.",
    dd: "Nothing in the diary currently wins. We put training on the calendar before intensity.",
  },
  health: {
    aa: "Energy and recovery look like they can take a real block of training.",
    ab: "Ready to train, sleep only okay. We keep load honest so sleep can catch up.",
    ac: "You feel ready while sleep is broken. That usually lies. We train around sleep, not through it.",
    ad: "Capable body, unmanaged sleep. That's how overreach starts. Track it before we load you.",
    ba: "A bit run down, but sleeping. Capable. We don't pretend you're at 100.",
    bb: "Capable, not fresh. Sleep is enough, not great. A coach manages that; a PDF doesn't.",
    bc: "Run down and sleeping badly. 1:1 volume would be the wrong medicine.",
    bd: "Run down, sleep untracked. We sort that before intensity.",
    ca: "Tired or sore, even with decent sleep. Recovery is the constraint, not effort.",
    cb: "Tired, sore, sleep just okay. Challenge pace, not Kane's 1:1 pace.",
    cc: "Tired and sleeping badly. Guessing at health is how people quit. Sort sleep first.",
    cd: "Sore, tired, sleep untracked. No 1:1 until this is named.",
    da: "Something's off and you know it, even if sleep looks fine. We do not guess on a call — we start easier.",
    db: "Something's off, sleep not great. Honest next step is a coached block, not max load.",
    dc: "Something's off and sleep is broken. Group or Challenge until that's not a mystery.",
    dd: "Guessing at health is how people quit. We sort sleep and recovery before volume.",
  },
  mindset: {
    aa: "You already take coaching and you want Kane's standard. That's the 1:1 signal.",
    ab: "A coach works for you if the fit is right. We find the fit on a call — you are not browsing.",
    ac: "A coach has worked, but you are not committed this time. Curiosity isn't 1:1.",
    ad: "You know coaching works. You are just looking. Free group. Come back when you want the seat.",
    ba: "You hold yourself some weeks, and you are ready now. External standard will finish the job.",
    bb: "Some weeks you hold the line, and you'll take a coach if it fits. That's Challenge, then the call.",
    bc: "Self-coached some weeks, curious not committed. Honest next step is the group or Challenge.",
    bd: "You coach yourself sometimes and you are just looking. No application yet.",
    ca: "Nobody holds the line, and you want that to change now. That's why the Challenge exists.",
    cb: "Nobody holds the line. You'll take it if the fit is right. Start with eight weeks of someone else holding it.",
    cc: "Nobody is holding the line, and you are still only curious. Group first.",
    cd: "Nobody is holding the line and you're just looking. Stay in the ecosystem. Don't pay yet.",
    da: "You don't want accountability, but you say you want the standard. Those two answers disagree. Group.",
    db: "You don't want to be held yet. If the fit is right later, the door is the Challenge.",
    dc: "Not ready to be coached, and only curious. Free group is the honest product.",
    dd: "You don't want the standard held. Paying for Kane would be a waste of both of you.",
  },
};

const BAND: Record<DnaCategoryId, Record<"high" | "mid" | "low", string>> = {
  journey: {
    high: "You already have a run going. The job now is a higher standard, not another restart.",
    mid: "You start. Then life hits. This is a follow-through problem, not a knowledge problem.",
    low: "There is no currently-working week to protect. We build one before we talk 1:1.",
  },
  training: {
    high: "Sessions are happening. Kane can load this without teaching you how to show up.",
    mid: "You train enough to know it works — not enough for the result you want. Fix the misses.",
    low: "The plan is not the issue. Completing sessions is. Challenge first.",
  },
  nutrition: {
    high: "Eating is structured enough to support training. Keep the boring bits boring.",
    mid: "Weekdays hold. Weekends leak. Close that gap and the body changes catch up.",
    low: "Training without food structure burns time. We lock protein and portions first.",
  },
  routine: {
    high: "The week has a slot for this. That is rarer than people admit.",
    mid: "You fit training in. It is not locked. Locked times beat good intentions.",
    low: "Nothing in the diary currently wins. We put training on the calendar before intensity.",
  },
  health: {
    high: "Energy and recovery look like they can take a real block of training.",
    mid: "You can train. Sleep and recovery are leaving marks. We train around that, not through it.",
    low: "Guessing at health is how people quit. We sort sleep and recovery before volume.",
  },
  mindset: {
    high: "You want the standard and you will take coaching. That is the 1:1 signal.",
    mid: "You will do it some weeks. Accountable weeks are the ones that change the body.",
    low: "Nobody is holding the line yet. A free group is the honest first step.",
  },
};

export function insightFor(
  id: DnaCategoryId,
  optionA: string,
  optionB: string,
  score: number,
): string {
  const specific = COPIES[id][pair(optionA || "b", optionB || "b")];
  if (specific) return specific;
  const band = score >= 80 ? "high" : score >= 50 ? "mid" : "low";
  return BAND[id][band];
}
