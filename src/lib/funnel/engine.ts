import type { CmsFunnelField } from "@/lib/cms/types";
import type {
  CoachingTier,
  QuestionnaireAnswers,
} from "@/types/lead";

export function interpolateFunnelText(
  template: string,
  vars: {
    name?: string;
    tier?: string;
    price?: string;
    email?: string;
  },
): string {
  const tierLabel =
    vars.tier === "elite" ? "Elite" : vars.tier === "pro" ? "Pro" : vars.tier;
  return template
    .replaceAll("{name}", vars.name?.trim() || "there")
    .replaceAll("{tier}", tierLabel || "Pro")
    .replaceAll("{price}", vars.price || "")
    .replaceAll("{email}", vars.email?.trim() || "");
}

export function answersFromChat(
  partial: Partial<QuestionnaireAnswers>,
  defaultTier: CoachingTier,
): QuestionnaireAnswers {
  const tier: CoachingTier =
    partial.tier === "elite" || partial.tier === "pro"
      ? partial.tier
      : defaultTier;

  return {
    tier,
    name: (partial.name ?? "").trim(),
    email: (partial.email ?? "").trim(),
    mobile: (partial.mobile ?? "").trim(),
    instagram: (partial.instagram ?? "").trim() || "-",
    mainGoal: partial.mainGoal || "general health",
    trainingNow: partial.trainingNow || "3–4 days",
    daysCommit: partial.daysCommit || "",
    medical: (partial.medical ?? "").trim() || "none",
    stoppedResults: (partial.stoppedResults ?? "").trim() || "via chat",
    whyNow: (partial.whyNow ?? "").trim() || "via chat",
    structuredProgramme:
      (partial.structuredProgramme ?? "").trim() || "via chat",
    investment: partial.investment || "",
    privacyConsent: Boolean(partial.privacyConsent),
  };
}

export function validateChatField(
  field: CmsFunnelField,
  answers: Partial<QuestionnaireAnswers>,
): string | null {
  switch (field) {
    case "message":
      return null;
    case "tier":
      return answers.tier === "pro" || answers.tier === "elite"
        ? null
        : "Pick Pro or Elite.";
    case "name":
      return answers.name?.trim() ? null : "Name is required.";
    case "email":
      return answers.email?.includes("@")
        ? null
        : "A valid email is required.";
    case "mobile":
      return answers.mobile?.trim() ? null : "Mobile is required.";
    case "instagram":
      return answers.instagram?.trim() ? null : "Instagram is required.";
    case "mainGoal":
      return answers.mainGoal ? null : "Select a goal.";
    case "trainingNow":
      return answers.trainingNow ? null : "Select how you train now.";
    case "daysCommit":
      return answers.daysCommit ? null : "Select how many days you can train.";
    case "medical":
      return answers.medical?.trim()
        ? null
        : 'Type "None" if nothing applies.';
    case "stoppedResults":
      return answers.stoppedResults?.trim()
        ? null
        : "Share what has stopped you before.";
    case "whyNow":
      return answers.whyNow?.trim() ? null : "Tell us why now.";
    case "structuredProgramme":
      return answers.structuredProgramme?.trim()
        ? null
        : "Share your programme experience.";
    case "investment":
      return answers.investment ? null : "Select an answer.";
    case "privacy":
      return answers.privacyConsent
        ? null
        : "Privacy consent is required to send this.";
    default:
      return null;
  }
}
