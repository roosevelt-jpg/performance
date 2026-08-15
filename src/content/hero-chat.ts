export type ChatLine = {
  from: "coach" | "user";
  text: string;
};

export const HERO_CHAT: ChatLine[] = [
  { from: "coach", text: "Watch the video. Then we'll see if Pro is a fit." },
  { from: "user", text: "What do you need?" },
  {
    from: "coach",
    text: "Name, days you can train, whether you're ready to invest. Two minutes.",
  },
  { from: "user", text: "Let's go." },
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
