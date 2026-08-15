export type ChatLine = {
  from: "coach" | "user";
  text: string;
};

export const HERO_CHAT: ChatLine[] = [
  { from: "coach", text: "Day 12. How did training feel yesterday?" },
  { from: "user", text: "Heavy. Legs are wrecked." },
  { from: "coach", text: "Good. That’s growth. 30g protein within the hour." },
  { from: "user", text: "On it. Swap rows for pull-ups?" },
  { from: "coach", text: "Yes, same target. Film a set and send it over." },
];

export const COACH_CHAT: ChatLine[] = [
  { from: "coach", text: "It’s 9:10pm. You’ve not logged dinner. What did you have?" },
  {
    from: "user",
    text: "Chicken, rice, salad. Movie night so ice cream too.",
  },
  {
    from: "coach",
    text: "Solid meal. The ice cream’s fine. That’s life. Add a 15-min walk tomorrow and we’re square.",
  },
];
