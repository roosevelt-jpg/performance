import { describe, expect, it } from "vitest";
import {
  isWhatsAppTemplateLanguage,
  WHATSAPP_TEMPLATE_LANGUAGES,
  whatsappLanguageOptions,
} from "./whatsappLanguages";

describe("WhatsApp template languages", () => {
  it("covers Meta's published template language set", () => {
    const codes = WHATSAPP_TEMPLATE_LANGUAGES.map((row) => row.code);
    expect(codes).toContain("en");
    expect(codes).toContain("en_US");
    expect(codes).toContain("en_GB");
    expect(codes).toContain("ar");
    expect(codes).toContain("es_MX");
    expect(codes).toContain("pt_BR");
    expect(codes).toContain("zh_CN");
    expect(codes).toContain("ja");
    expect(WHATSAPP_TEMPLATE_LANGUAGES.length).toBeGreaterThan(80);
  });

  it("keeps an unknown saved code visible in the picker", () => {
    expect(isWhatsAppTemplateLanguage("en")).toBe(true);
    expect(isWhatsAppTemplateLanguage("xx_YY")).toBe(false);
    expect(whatsappLanguageOptions("xx_YY")[0]?.code).toBe("xx_YY");
  });
});
