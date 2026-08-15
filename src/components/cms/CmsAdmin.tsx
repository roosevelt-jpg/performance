"use client";

import { useCallback, useEffect, useState } from "react";
import { AssetUpload } from "@/components/cms/AssetUpload";
import { DEFAULT_CMS } from "@/lib/cms/defaults";
import type {
  CmsContent,
  CmsImageSection,
  CmsMediaSlot,
  CmsTier,
  CmsVideoSection,
} from "@/lib/cms/types";
import { CMS_MEDIA_SLOT_OPTIONS } from "@/lib/cms/types";
import { toPlainText } from "@/lib/text/plain";

type TabId =
  | "site"
  | "chrome"
  | "home"
  | "tiers"
  | "questionnaire"
  | "funnel";

const TABS: { id: TabId; label: string }[] = [
  { id: "site", label: "Brand & SEO" },
  { id: "chrome", label: "Nav & Footer" },
  { id: "home", label: "Home / Media" },
  { id: "tiers", label: "Tier cards" },
  { id: "questionnaire", label: "Questionnaire" },
  { id: "funnel", label: "Challenge / Calendar / Confirm" },
];

const inputClass =
  "mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-base text-[var(--fg)] outline-none focus:border-[var(--accent)] sm:text-sm";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-[var(--fg)]">{label}</span>
      {hint ? (
        <span className="block text-xs text-[var(--muted)]">{hint}</span>
      ) : null}
      {children}
    </label>
  );
}

function Text({
  value,
  onChange,
  multiline,
}: {
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  if (multiline) {
    return (
      <textarea
        className={`${inputClass} min-h-24`}
        value={value}
        onChange={(e) => onChange(toPlainText(e.target.value))}
      />
    );
  }
  return (
    <input
      className={inputClass}
      value={value}
      onChange={(e) => onChange(toPlainText(e.target.value))}
    />
  );
}

function cmsId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}`;
}

function LinesEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <Field label={label} hint="One line per item — add, edit, or delete lines">
      <textarea
        className={`${inputClass} min-h-28 font-mono text-xs sm:text-sm`}
        value={value.join("\n")}
        onChange={(e) =>
          onChange(
            e.target.value.split("\n").map((line) => toPlainText(line.trimEnd())),
          )
        }
      />
    </Field>
  );
}

function AddBlock({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-semibold"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function RemoveBlock({
  label = "Remove",
  onClick,
}: {
  label?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="self-end text-sm text-red-400"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
      <h2 className="text-lg font-semibold text-[var(--fg)]">{title}</h2>
      {children}
    </section>
  );
}

export function CmsAdmin() {
  const [tab, setTab] = useState<TabId>("site");
  const [form, setForm] = useState<CmsContent>(DEFAULT_CMS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [writable, setWritable] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cms", { credentials: "include" });
      const json = (await res.json()) as {
        content?: CmsContent;
        storage?: { writable: boolean; path: string };
        error?: string;
      };
      if (!res.ok) {
        setError(json.error ?? "Failed to load CMS");
        return;
      }
      if (json.content) setForm(json.content);
      setWritable(json.storage?.writable ?? true);
    } catch {
      setError("Failed to load CMS");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/cms", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: form }),
      });
      const json = (await res.json()) as {
        content?: CmsContent;
        error?: string;
      };
      if (!res.ok) {
        setError(json.error ?? "Save failed");
        return;
      }
      if (json.content) setForm(json.content);
      setMessage("CMS saved — live site will pick this up within ~30s.");
    } catch {
      setError("Save failed");
    } finally {
      setSaving(false);
    }
  }

  function updateTier(index: number, patch: Partial<CmsTier>) {
    setForm((f) => ({
      ...f,
      tiers: f.tiers.map((t, i) => (i === index ? { ...t, ...patch } : t)),
    }));
  }

  function addTier() {
    setForm((f) => ({
      ...f,
      tiers: [
        ...f.tiers,
        {
          id: cmsId("tier"),
          enabled: true,
          highlight: false,
          name: "New programme",
          badge: "",
          subhead: "",
          body: [],
          includes: [],
          cta: { kind: "book", label: "Apply", bookTier: "pro" },
          applyBadge: "Application only",
        },
      ],
    }));
  }

  function removeTier(index: number) {
    setForm((f) => ({
      ...f,
      tiers: f.tiers.filter((_, i) => i !== index),
    }));
  }

  function updateImageSection(
    index: number,
    patch: Partial<CmsImageSection>,
  ) {
    setForm((f) => ({
      ...f,
      home: {
        ...f.home,
        imageSections: f.home.imageSections.map((s, i) =>
          i === index ? { ...s, ...patch } : s,
        ),
      },
    }));
  }

  function updateVideoSection(
    index: number,
    patch: Partial<CmsVideoSection>,
  ) {
    setForm((f) => ({
      ...f,
      home: {
        ...f.home,
        videoSections: f.home.videoSections.map((s, i) =>
          i === index ? { ...s, ...patch } : s,
        ),
      },
    }));
  }

  if (loading) {
    return <p className="text-sm text-[var(--muted)]">Loading CMS…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={[
              "rounded-md px-3 py-2 text-sm font-semibold",
              tab === t.id
                ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                : "border border-[var(--border)] text-[var(--muted)]",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="text-sm text-[var(--accent)]">{message}</p>
      ) : null}

      {tab === "site" ? (
        <div className="space-y-6">
          <Section title="Brand">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Brand name">
                <Text
                  value={form.site.brand.name}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      site: {
                        ...form.site,
                        brand: { ...form.site.brand, name: v },
                      },
                    })
                  }
                />
              </Field>
              <Field label="Product line">
                <Text
                  value={form.site.brand.product}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      site: {
                        ...form.site,
                        brand: { ...form.site.brand, product: v },
                      },
                    })
                  }
                />
              </Field>
              <AssetUpload
                label="Header logo"
                folder="images"
                value={form.site.brand.logoUrl}
                onChange={(url) =>
                  setForm({
                    ...form,
                    site: {
                      ...form.site,
                      brand: { ...form.site.brand, logoUrl: url },
                    },
                  })
                }
              />
              <p className="text-xs text-[var(--muted)]">
                Shown in the header on every page. Upload a PNG or WebP to replace
                the default Formula mark. Save CMS after uploading.
              </p>
              <Field label="Wordmark (fallback text only)">
                <Text
                  value={form.site.brand.wordmark}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      site: {
                        ...form.site,
                        brand: { ...form.site.brand, wordmark: v },
                      },
                    })
                  }
                />
              </Field>
              <Field label="Accent word">
                <Text
                  value={form.site.brand.accent}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      site: {
                        ...form.site,
                        brand: { ...form.site.brand, accent: v },
                      },
                    })
                  }
                />
              </Field>
              <Field label="Coach name">
                <Text
                  value={form.site.brand.coach}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      site: {
                        ...form.site,
                        brand: { ...form.site.brand, coach: v },
                      },
                    })
                  }
                />
              </Field>
              <Field label="Marketing site URL">
                <Text
                  value={form.site.brand.siteUrl}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      site: {
                        ...form.site,
                        brand: { ...form.site.brand, siteUrl: v },
                      },
                    })
                  }
                />
              </Field>
            </div>
          </Section>
          <Section title="SEO">
            <Field label="Document title">
              <Text
                value={form.site.seo.title}
                onChange={(v) =>
                  setForm({
                    ...form,
                    site: {
                      ...form.site,
                      seo: { ...form.site.seo, title: v },
                    },
                  })
                }
              />
            </Field>
            <Field label="Meta description">
              <Text
                multiline
                value={form.site.seo.description}
                onChange={(v) =>
                  setForm({
                    ...form,
                    site: {
                      ...form.site,
                      seo: { ...form.site.seo, description: v },
                    },
                  })
                }
              />
            </Field>
            <Field
              label="Keywords"
              hint="Comma-separated. Google mostly ignores these; they still help you keep the topic list in one place."
            >
              <Text
                multiline
                value={form.site.seo.keywords ?? ""}
                onChange={(v) =>
                  setForm({
                    ...form,
                    site: {
                      ...form.site,
                      seo: { ...form.site.seo, keywords: v },
                    },
                  })
                }
              />
            </Field>
            <AssetUpload
              label="Share image (Open Graph)"
              folder="images"
              value={form.site.seo.ogImageUrl ?? ""}
              onChange={(url) =>
                setForm({
                  ...form,
                  site: {
                    ...form.site,
                    seo: { ...form.site.seo, ogImageUrl: url },
                  },
                })
              }
            />
          </Section>
        </div>
      ) : null}

      {tab === "chrome" ? (
        <div className="space-y-6">
          <Section title="Header">
            <Field label="Logo link href">
              <Text
                value={form.chrome.headerLogoHref}
                onChange={(v) =>
                  setForm({
                    ...form,
                    chrome: { ...form.chrome, headerLogoHref: v },
                  })
                }
              />
            </Field>
            {form.chrome.nav.map((link, i) => (
              <div
                key={link.id}
                className="grid grid-cols-1 gap-3 rounded-md border border-[var(--border)] p-3 sm:grid-cols-4"
              >
                <Field label="Label">
                  <Text
                    value={link.label}
                    onChange={(v) => {
                      const nav = [...form.chrome.nav];
                      nav[i] = { ...link, label: v };
                      setForm({
                        ...form,
                        chrome: { ...form.chrome, nav },
                      });
                    }}
                  />
                </Field>
                <Field label="Href">
                  <Text
                    value={link.href}
                    onChange={(v) => {
                      const nav = [...form.chrome.nav];
                      nav[i] = { ...link, href: v };
                      setForm({
                        ...form,
                        chrome: { ...form.chrome, nav },
                      });
                    }}
                  />
                </Field>
                <label className="flex items-end gap-2 pb-2 text-sm text-[var(--fg-soft)]">
                  <input
                    type="checkbox"
                    className="accent-[var(--accent)]"
                    checked={link.visible}
                    onChange={(e) => {
                      const nav = [...form.chrome.nav];
                      nav[i] = { ...link, visible: e.target.checked };
                      setForm({
                        ...form,
                        chrome: { ...form.chrome, nav },
                      });
                    }}
                  />
                  Visible
                </label>
                <RemoveBlock
                  onClick={() =>
                    setForm({
                      ...form,
                      chrome: {
                        ...form.chrome,
                        nav: form.chrome.nav.filter((_, idx) => idx !== i),
                      },
                    })
                  }
                />
              </div>
            ))}
            <AddBlock
              label="Add nav link"
              onClick={() =>
                setForm({
                  ...form,
                  chrome: {
                    ...form.chrome,
                    nav: [
                      ...form.chrome.nav,
                      {
                        id: cmsId("nav"),
                        label: "New link",
                        href: "/",
                        visible: true,
                      },
                    ],
                  },
                })
              }
            />
          </Section>
          <Section title="Footer">
            <Field label="Copyright">
              <Text
                value={form.chrome.footerCopyright}
                onChange={(v) =>
                  setForm({
                    ...form,
                    chrome: { ...form.chrome, footerCopyright: v },
                  })
                }
              />
            </Field>
            {form.chrome.footerLinks.map((link, i) => (
              <div
                key={link.id}
                className="grid grid-cols-1 gap-3 rounded-md border border-[var(--border)] p-3 sm:grid-cols-4"
              >
                <Field label="Label">
                  <Text
                    value={link.label}
                    onChange={(v) => {
                      const footerLinks = [...form.chrome.footerLinks];
                      footerLinks[i] = { ...link, label: v };
                      setForm({
                        ...form,
                        chrome: { ...form.chrome, footerLinks },
                      });
                    }}
                  />
                </Field>
                <Field label="Href">
                  <Text
                    value={link.href}
                    onChange={(v) => {
                      const footerLinks = [...form.chrome.footerLinks];
                      footerLinks[i] = { ...link, href: v };
                      setForm({
                        ...form,
                        chrome: { ...form.chrome, footerLinks },
                      });
                    }}
                  />
                </Field>
                <label className="flex items-end gap-2 pb-2 text-sm text-[var(--fg-soft)]">
                  <input
                    type="checkbox"
                    className="accent-[var(--accent)]"
                    checked={link.visible}
                    onChange={(e) => {
                      const footerLinks = [...form.chrome.footerLinks];
                      footerLinks[i] = {
                        ...link,
                        visible: e.target.checked,
                      };
                      setForm({
                        ...form,
                        chrome: { ...form.chrome, footerLinks },
                      });
                    }}
                  />
                  Visible
                </label>
                <RemoveBlock
                  onClick={() =>
                    setForm({
                      ...form,
                      chrome: {
                        ...form.chrome,
                        footerLinks: form.chrome.footerLinks.filter(
                          (_, idx) => idx !== i,
                        ),
                      },
                    })
                  }
                />
              </div>
            ))}
            <AddBlock
              label="Add footer link"
              onClick={() =>
                setForm({
                  ...form,
                  chrome: {
                    ...form.chrome,
                    footerLinks: [
                      ...form.chrome.footerLinks,
                      {
                        id: cmsId("footer"),
                        label: "New link",
                        href: "/",
                        visible: true,
                      },
                    ],
                  },
                })
              }
            />
          </Section>
        </div>
      ) : null}

      {tab === "home" ? (
        <div className="space-y-6">
          <Section title="Hero">
            <Field label="Eyebrow (audience line)">
              <Text
                value={form.home.hero.eyebrow}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      hero: { ...form.home.hero, eyebrow: v },
                    },
                  })
                }
              />
            </Field>
            <Field label="Headline">
              <Text
                multiline
                value={form.home.hero.headline}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      hero: { ...form.home.hero, headline: v },
                    },
                  })
                }
              />
            </Field>
            <Field label="Body">
              <Text
                multiline
                value={form.home.hero.body}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      hero: { ...form.home.hero, body: v },
                    },
                  })
                }
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Primary CTA label">
                <Text
                  value={form.home.hero.cta.label}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        hero: {
                          ...form.home.hero,
                          cta: { ...form.home.hero.cta, label: v },
                        },
                      },
                    })
                  }
                />
              </Field>
              <Field label="Primary CTA href">
                <Text
                  value={form.home.hero.cta.href}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        hero: {
                          ...form.home.hero,
                          cta: { ...form.home.hero.cta, href: v },
                        },
                      },
                    })
                  }
                />
              </Field>
              <Field label="Secondary CTA label">
                <Text
                  value={form.home.hero.secondaryCta.label}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        hero: {
                          ...form.home.hero,
                          secondaryCta: {
                            ...form.home.hero.secondaryCta,
                            label: v,
                          },
                        },
                      },
                    })
                  }
                />
              </Field>
              <Field label="Secondary CTA href">
                <Text
                  value={form.home.hero.secondaryCta.href}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        hero: {
                          ...form.home.hero,
                          secondaryCta: {
                            ...form.home.hero.secondaryCta,
                            href: v,
                          },
                        },
                      },
                    })
                  }
                />
              </Field>
            </div>
            <Field label="CTA note under buttons">
              <Text
                value={form.home.hero.ctaNote}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      hero: { ...form.home.hero, ctaNote: v },
                    },
                  })
                }
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Hero background"
                hint="Image or video fills the hero. Headline and buttons stay on top with a dark overlay."
              >
                <select
                  className={inputClass}
                  value={form.home.hero.mediaType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        hero: {
                          ...form.home.hero,
                          mediaType: e.target.value as
                            | "none"
                            | "image"
                            | "video"
                            | "youtube",
                          mediaUrl: "",
                        },
                      },
                    })
                  }
                >
                  <option value="none">None (brand graphic)</option>
                  <option value="image">Background image</option>
                  <option value="video">Background video (upload)</option>
                  <option value="youtube">Background YouTube video</option>
                </select>
              </Field>
              {form.home.hero.mediaType === "image" ? (
                <AssetUpload
                  label="Hero background image"
                  folder="hero"
                  value={form.home.hero.mediaUrl}
                  onChange={(url) =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        hero: {
                          ...form.home.hero,
                          mediaType: "image",
                          mediaUrl: url,
                        },
                      },
                    })
                  }
                />
              ) : null}
              {form.home.hero.mediaType === "video" ? (
                <AssetUpload
                  label="Hero background video"
                  folder="hero"
                  kind="video"
                  value={form.home.hero.mediaUrl}
                  onChange={(url) =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        hero: {
                          ...form.home.hero,
                          mediaType: "video",
                          mediaUrl: url,
                        },
                      },
                    })
                  }
                />
              ) : null}
              {form.home.hero.mediaType === "youtube" ? (
                <Field
                  label="YouTube video ID"
                  hint="11-character ID. Plays muted and looping behind the headline."
                >
                  <Text
                    value={form.home.hero.mediaUrl}
                    onChange={(v) =>
                      setForm({
                        ...form,
                        home: {
                          ...form.home,
                          hero: { ...form.home.hero, mediaUrl: v },
                        },
                      })
                    }
                  />
                </Field>
              ) : null}
              {form.home.hero.mediaType === "video" ||
              form.home.hero.mediaType === "youtube" ? (
                <AssetUpload
                  label="Poster image (shown before video loads)"
                  folder="hero"
                  value={form.home.hero.mediaPoster}
                  onChange={(url) =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        hero: { ...form.home.hero, mediaPoster: url },
                      },
                    })
                  }
                />
              ) : null}
              <Field label="Media alt text">
                <Text
                  value={form.home.hero.mediaAlt}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        hero: { ...form.home.hero, mediaAlt: v },
                      },
                    })
                  }
                />
              </Field>
              <AssetUpload
                label="Kane hero photo (phone mockup)"
                folder="hero"
                value={form.home.hero.portraitUrl}
                onChange={(url) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      hero: { ...form.home.hero, portraitUrl: url },
                    },
                  })
                }
              />
              <Field label="Portrait alt text">
                <Text
                  value={form.home.hero.portraitAlt}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        hero: { ...form.home.hero, portraitAlt: v },
                      },
                    })
                  }
                />
              </Field>
            </div>
          </Section>

          <Section title="VSL video (watch then apply)">
            <p className="text-xs text-[var(--muted)]">
              Step 1 watch / Step 2 apply, with an optional watch-gate modal —
              same pattern as a converting VSL funnel. Video plays on this site.
            </p>
            <label className="flex items-center gap-2 text-sm text-[var(--fg-soft)]">
              <input
                type="checkbox"
                className="accent-[var(--accent)]"
                checked={form.home.vsl.enabled}
                onChange={(e) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      vsl: { ...form.home.vsl, enabled: e.target.checked },
                    },
                  })
                }
              />
              Enabled
            </label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Step 1 label">
                <Text
                  value={form.home.vsl.stepLabel}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        vsl: { ...form.home.vsl, stepLabel: v },
                      },
                    })
                  }
                />
              </Field>
              <Field label="Step 2 label">
                <Text
                  value={form.home.vsl.applyStepLabel}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        vsl: { ...form.home.vsl, applyStepLabel: v },
                      },
                    })
                  }
                />
              </Field>
            </div>
            <Field label="Video heading">
              <Text
                value={form.home.vsl.heading}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      vsl: { ...form.home.vsl, heading: v },
                    },
                  })
                }
              />
            </Field>
            <Field label="Helper under video">
              <Text
                multiline
                value={form.home.vsl.helper}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      vsl: { ...form.home.vsl, helper: v },
                    },
                  })
                }
              />
            </Field>
            <Field
              label="YouTube URL or video ID"
              hint="Paste a full YouTube URL (watch, youtu.be, or embed) or the 11-character ID."
            >
              <Text
                value={form.home.vsl.youtubeUrl}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      vsl: { ...form.home.vsl, youtubeUrl: v },
                    },
                  })
                }
              />
            </Field>
            <AssetUpload
              label="Custom thumbnail (optional)"
              folder="thumbnails"
              value={form.home.vsl.thumbnailUrl}
              onChange={(url) =>
                setForm({
                  ...form,
                  home: {
                    ...form.home,
                    vsl: { ...form.home.vsl, thumbnailUrl: url },
                  },
                })
              }
            />
            <Field label="Mute / play hint on thumbnail">
              <Text
                value={form.home.vsl.muteHint}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      vsl: { ...form.home.vsl, muteHint: v },
                    },
                  })
                }
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Apply CTA label">
                <Text
                  value={form.home.vsl.applyCta.label}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        vsl: {
                          ...form.home.vsl,
                          applyCta: { ...form.home.vsl.applyCta, label: v },
                        },
                      },
                    })
                  }
                />
              </Field>
              <Field label="Apply CTA href">
                <Text
                  value={form.home.vsl.applyCta.href}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        vsl: {
                          ...form.home.vsl,
                          applyCta: { ...form.home.vsl.applyCta, href: v },
                        },
                      },
                    })
                  }
                />
              </Field>
            </div>
            <Field label="Apply note">
              <Text
                value={form.home.vsl.applyNote}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      vsl: { ...form.home.vsl, applyNote: v },
                    },
                  })
                }
              />
            </Field>
            <label className="flex items-center gap-2 text-sm text-[var(--fg-soft)]">
              <input
                type="checkbox"
                className="accent-[var(--accent)]"
                checked={form.home.vsl.requireWatch}
                onChange={(e) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      vsl: {
                        ...form.home.vsl,
                        requireWatch: e.target.checked,
                      },
                    },
                  })
                }
              />
              Require watching before apply (watch-gate modal)
            </label>
            <Field label="Gate modal title">
              <Text
                value={form.home.vsl.gateTitle}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      vsl: { ...form.home.vsl, gateTitle: v },
                    },
                  })
                }
              />
            </Field>
            <Field label="Gate modal body">
              <Text
                multiline
                value={form.home.vsl.gateBody}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      vsl: { ...form.home.vsl, gateBody: v },
                    },
                  })
                }
              />
            </Field>
            <Field label="Gate modal button">
              <Text
                value={form.home.vsl.gateCta}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      vsl: { ...form.home.vsl, gateCta: v },
                    },
                  })
                }
              />
            </Field>
          </Section>

          <Section title="Proof strip">
            <p className="text-xs text-[var(--muted)]">
              Live stats Kane types himself. Empty figures do not show on the
              page. Same fields as Admin → Funnel → Live stats.
            </p>
            <label className="flex items-center gap-2 text-sm text-[var(--fg-soft)]">
              <input
                type="checkbox"
                className="accent-[var(--accent)]"
                checked={form.home.proof.enabled}
                onChange={(e) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      proof: { ...form.home.proof, enabled: e.target.checked },
                    },
                  })
                }
              />
              Enabled
            </label>
            {form.home.proof.items.map((item, i) => (
              <div
                key={item.id}
                className="grid grid-cols-1 gap-3 rounded-md border border-[var(--border)] p-3 sm:grid-cols-[1fr_1fr_auto]"
              >
                <Field label="Value">
                  <Text
                    value={item.value}
                    onChange={(v) => {
                      const items = form.home.proof.items.map((row, idx) =>
                        idx === i ? { ...row, value: v } : row,
                      );
                      setForm({
                        ...form,
                        home: {
                          ...form.home,
                          proof: { ...form.home.proof, items },
                        },
                      });
                    }}
                  />
                </Field>
                <Field label="Label">
                  <Text
                    value={item.label}
                    onChange={(v) => {
                      const items = form.home.proof.items.map((row, idx) =>
                        idx === i ? { ...row, label: v } : row,
                      );
                      setForm({
                        ...form,
                        home: {
                          ...form.home,
                          proof: { ...form.home.proof, items },
                        },
                      });
                    }}
                  />
                </Field>
                <RemoveBlock
                  onClick={() => {
                    const items = form.home.proof.items.filter((_, idx) => idx !== i);
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        proof: { ...form.home.proof, items },
                      },
                    });
                  }}
                />
              </div>
            ))}
            <button
              type="button"
              className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-semibold"
              onClick={() =>
                setForm({
                  ...form,
                  home: {
                    ...form.home,
                    proof: {
                      ...form.home.proof,
                      items: [
                        ...form.home.proof.items,
                        {
                          id: cmsId("p"),
                          value: "",
                          label: "",
                        },
                      ],
                    },
                  },
                })
              }
            >
              Add stat
            </button>
          </Section>

          <Section title="Problem section">
            <label className="flex items-center gap-2 text-sm text-[var(--fg-soft)]">
              <input
                type="checkbox"
                className="accent-[var(--accent)]"
                checked={form.home.problem.enabled}
                onChange={(e) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      problem: {
                        ...form.home.problem,
                        enabled: e.target.checked,
                      },
                    },
                  })
                }
              />
              Enabled
            </label>
            <Field label="Eyebrow">
              <Text
                value={form.home.problem.eyebrow}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      problem: { ...form.home.problem, eyebrow: v },
                    },
                  })
                }
              />
            </Field>
            <Field label="Title">
              <Text
                multiline
                value={form.home.problem.title}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      problem: { ...form.home.problem, title: v },
                    },
                  })
                }
              />
            </Field>
            <Field label="Body">
              <Text
                multiline
                value={form.home.problem.body}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      problem: { ...form.home.problem, body: v },
                    },
                  })
                }
              />
            </Field>
          </Section>

          <Section title="Founder credentials (after testimonials)">
            <label className="flex items-center gap-2 text-sm text-[var(--fg-soft)]">
              <input
                type="checkbox"
                className="accent-[var(--accent)]"
                checked={form.home.credentials.enabled}
                onChange={(e) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      credentials: {
                        ...form.home.credentials,
                        enabled: e.target.checked,
                      },
                    },
                  })
                }
              />
              Enabled
            </label>
            <Field label="Eyebrow">
              <Text
                value={form.home.credentials.eyebrow}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      credentials: { ...form.home.credentials, eyebrow: v },
                    },
                  })
                }
              />
            </Field>
            <Field label="Heading">
              <Text
                value={form.home.credentials.heading}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      credentials: { ...form.home.credentials, heading: v },
                    },
                  })
                }
              />
            </Field>
            <Field label="Body">
              <Text
                multiline
                value={form.home.credentials.body}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      credentials: { ...form.home.credentials, body: v },
                    },
                  })
                }
              />
            </Field>
            <AssetUpload
              label="Kane photo"
              folder="hero"
              value={form.home.credentials.imageUrl ?? ""}
              onChange={(url) =>
                setForm({
                  ...form,
                  home: {
                    ...form.home,
                    credentials: {
                      ...form.home.credentials,
                      imageUrl: url,
                    },
                  },
                })
              }
            />
            <Field label="Photo alt">
              <Text
                value={form.home.credentials.imageAlt ?? ""}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      credentials: { ...form.home.credentials, imageAlt: v },
                    },
                  })
                }
              />
            </Field>
            {form.home.credentials.items.map((item, i) => (
              <div
                key={item.id}
                className="grid grid-cols-1 gap-3 rounded-md border border-[var(--border)] p-3 sm:grid-cols-[1fr_1fr_auto]"
              >
                <Field label="Value">
                  <Text
                    value={item.value}
                    onChange={(v) => {
                      const items = form.home.credentials.items.map(
                        (row, idx) => (idx === i ? { ...row, value: v } : row),
                      );
                      setForm({
                        ...form,
                        home: {
                          ...form.home,
                          credentials: { ...form.home.credentials, items },
                        },
                      });
                    }}
                  />
                </Field>
                <Field label="Label">
                  <Text
                    value={item.label}
                    onChange={(v) => {
                      const items = form.home.credentials.items.map(
                        (row, idx) => (idx === i ? { ...row, label: v } : row),
                      );
                      setForm({
                        ...form,
                        home: {
                          ...form.home,
                          credentials: { ...form.home.credentials, items },
                        },
                      });
                    }}
                  />
                </Field>
                <RemoveBlock
                  onClick={() =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        credentials: {
                          ...form.home.credentials,
                          items: form.home.credentials.items.filter(
                            (_, idx) => idx !== i,
                          ),
                        },
                      },
                    })
                  }
                />
              </div>
            ))}
            <AddBlock
              label="Add credential stat"
              onClick={() =>
                setForm({
                  ...form,
                  home: {
                    ...form.home,
                    credentials: {
                      ...form.home.credentials,
                      items: [
                        ...form.home.credentials.items,
                        { id: cmsId("cred"), value: "", label: "" },
                      ],
                    },
                  },
                })
              }
            />
          </Section>

          <Section title="WhatsApp Performance Coach (after The Gap)">
            <label className="flex items-center gap-2 text-sm text-[var(--fg-soft)]">
              <input
                type="checkbox"
                className="accent-[var(--accent)]"
                checked={form.home.whatsappCoach.enabled}
                onChange={(e) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      whatsappCoach: {
                        ...form.home.whatsappCoach,
                        enabled: e.target.checked,
                      },
                    },
                  })
                }
              />
              Enabled
            </label>
            <Field label="Eyebrow">
              <Text
                value={form.home.whatsappCoach.eyebrow}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      whatsappCoach: { ...form.home.whatsappCoach, eyebrow: v },
                    },
                  })
                }
              />
            </Field>
            <Field label="Heading">
              <Text
                value={form.home.whatsappCoach.heading}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      whatsappCoach: { ...form.home.whatsappCoach, heading: v },
                    },
                  })
                }
              />
            </Field>
            <Field label="Body">
              <Text
                multiline
                value={form.home.whatsappCoach.body}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      whatsappCoach: { ...form.home.whatsappCoach, body: v },
                    },
                  })
                }
              />
            </Field>
            {form.home.whatsappCoach.steps.map((step, i) => (
              <div
                key={step.id}
                className="space-y-2 rounded-md border border-[var(--border)] p-3"
              >
                <Field label={`Step ${i + 1} title`}>
                  <Text
                    value={step.title}
                    onChange={(v) => {
                      const steps = form.home.whatsappCoach.steps.map(
                        (row, idx) => (idx === i ? { ...row, title: v } : row),
                      );
                      setForm({
                        ...form,
                        home: {
                          ...form.home,
                          whatsappCoach: { ...form.home.whatsappCoach, steps },
                        },
                      });
                    }}
                  />
                </Field>
                <Field label="Body">
                  <Text
                    multiline
                    value={step.body}
                    onChange={(v) => {
                      const steps = form.home.whatsappCoach.steps.map(
                        (row, idx) => (idx === i ? { ...row, body: v } : row),
                      );
                      setForm({
                        ...form,
                        home: {
                          ...form.home,
                          whatsappCoach: { ...form.home.whatsappCoach, steps },
                        },
                      });
                    }}
                  />
                </Field>
                <RemoveBlock
                  onClick={() =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        whatsappCoach: {
                          ...form.home.whatsappCoach,
                          steps: form.home.whatsappCoach.steps.filter(
                            (_, idx) => idx !== i,
                          ),
                        },
                      },
                    })
                  }
                />
              </div>
            ))}
            <AddBlock
              label="Add WhatsApp step"
              onClick={() =>
                setForm({
                  ...form,
                  home: {
                    ...form.home,
                    whatsappCoach: {
                      ...form.home.whatsappCoach,
                      steps: [
                        ...form.home.whatsappCoach.steps,
                        { id: cmsId("wa"), title: "", body: "" },
                      ],
                    },
                  },
                })
              }
            />
            <Field label="Chat mockup name">
              <Text
                value={form.home.whatsappCoach.chatName}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      whatsappCoach: {
                        ...form.home.whatsappCoach,
                        chatName: v,
                      },
                    },
                  })
                }
              />
            </Field>
            <Field label="Chat mockup message">
              <Text
                multiline
                value={form.home.whatsappCoach.chatMessage}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      whatsappCoach: {
                        ...form.home.whatsappCoach,
                        chatMessage: v,
                      },
                    },
                  })
                }
              />
            </Field>
          </Section>

          <Section title="Week 1 / week 8 benchmarks (after Coach)">
            <label className="flex items-center gap-2 text-sm text-[var(--fg-soft)]">
              <input
                type="checkbox"
                className="accent-[var(--accent)]"
                checked={form.home.benchmarks.enabled}
                onChange={(e) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      benchmarks: {
                        ...form.home.benchmarks,
                        enabled: e.target.checked,
                      },
                    },
                  })
                }
              />
              Enabled
            </label>
            <Field label="Eyebrow">
              <Text
                value={form.home.benchmarks.eyebrow}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      benchmarks: { ...form.home.benchmarks, eyebrow: v },
                    },
                  })
                }
              />
            </Field>
            <Field label="Heading">
              <Text
                value={form.home.benchmarks.heading}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      benchmarks: { ...form.home.benchmarks, heading: v },
                    },
                  })
                }
              />
            </Field>
            <Field label="Body">
              <Text
                multiline
                value={form.home.benchmarks.body}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      benchmarks: { ...form.home.benchmarks, body: v },
                    },
                  })
                }
              />
            </Field>
            {form.home.benchmarks.items.map((item, i) => (
              <div
                key={item.id}
                className="grid grid-cols-1 gap-3 rounded-md border border-[var(--border)] p-3 sm:grid-cols-[1fr_1fr_auto]"
              >
                <Field label="Value">
                  <Text
                    value={item.value}
                    onChange={(v) => {
                      const items = form.home.benchmarks.items.map((row, idx) =>
                        idx === i ? { ...row, value: v } : row,
                      );
                      setForm({
                        ...form,
                        home: {
                          ...form.home,
                          benchmarks: { ...form.home.benchmarks, items },
                        },
                      });
                    }}
                  />
                </Field>
                <Field label="Label">
                  <Text
                    value={item.label}
                    onChange={(v) => {
                      const items = form.home.benchmarks.items.map((row, idx) =>
                        idx === i ? { ...row, label: v } : row,
                      );
                      setForm({
                        ...form,
                        home: {
                          ...form.home,
                          benchmarks: { ...form.home.benchmarks, items },
                        },
                      });
                    }}
                  />
                </Field>
                <RemoveBlock
                  onClick={() =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        benchmarks: {
                          ...form.home.benchmarks,
                          items: form.home.benchmarks.items.filter(
                            (_, idx) => idx !== i,
                          ),
                        },
                      },
                    })
                  }
                />
              </div>
            ))}
            <AddBlock
              label="Add benchmark"
              onClick={() =>
                setForm({
                  ...form,
                  home: {
                    ...form.home,
                    benchmarks: {
                      ...form.home.benchmarks,
                      items: [
                        ...form.home.benchmarks.items,
                        { id: cmsId("bm"), value: "", label: "" },
                      ],
                    },
                  },
                })
              }
            />
          </Section>

          <Section title="How it works">
            <label className="flex items-center gap-2 text-sm text-[var(--fg-soft)]">
              <input
                type="checkbox"
                className="accent-[var(--accent)]"
                checked={form.home.howItWorks.enabled}
                onChange={(e) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      howItWorks: {
                        ...form.home.howItWorks,
                        enabled: e.target.checked,
                      },
                    },
                  })
                }
              />
              Enabled
            </label>
            <Field label="Heading">
              <Text
                value={form.home.howItWorks.heading}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      howItWorks: { ...form.home.howItWorks, heading: v },
                    },
                  })
                }
              />
            </Field>
            <Field label="Subhead">
              <Text
                multiline
                value={form.home.howItWorks.subhead}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      howItWorks: { ...form.home.howItWorks, subhead: v },
                    },
                  })
                }
              />
            </Field>
            {form.home.howItWorks.steps.map((step, i) => (
              <div
                key={step.id}
                className="space-y-3 rounded-md border border-[var(--border)] p-3"
              >
                <Field label={`Step ${i + 1} title`}>
                  <Text
                    value={step.title}
                    onChange={(v) => {
                      const steps = form.home.howItWorks.steps.map(
                        (row, idx) =>
                          idx === i ? { ...row, title: v } : row,
                      );
                      setForm({
                        ...form,
                        home: {
                          ...form.home,
                          howItWorks: { ...form.home.howItWorks, steps },
                        },
                      });
                    }}
                  />
                </Field>
                <Field label="Body">
                  <Text
                    multiline
                    value={step.body}
                    onChange={(v) => {
                      const steps = form.home.howItWorks.steps.map(
                        (row, idx) =>
                          idx === i ? { ...row, body: v } : row,
                      );
                      setForm({
                        ...form,
                        home: {
                          ...form.home,
                          howItWorks: { ...form.home.howItWorks, steps },
                        },
                      });
                    }}
                  />
                </Field>
                <RemoveBlock
                  onClick={() =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        howItWorks: {
                          ...form.home.howItWorks,
                          steps: form.home.howItWorks.steps.filter(
                            (_, idx) => idx !== i,
                          ),
                        },
                      },
                    })
                  }
                />
              </div>
            ))}
            <AddBlock
              label="Add how-it-works step"
              onClick={() =>
                setForm({
                  ...form,
                  home: {
                    ...form.home,
                    howItWorks: {
                      ...form.home.howItWorks,
                      steps: [
                        ...form.home.howItWorks.steps,
                        { id: cmsId("how"), title: "", body: "" },
                      ],
                    },
                  },
                })
              }
            />
          </Section>

          <Section title="Tiers section headings">
            <label className="flex items-center gap-2 text-sm text-[var(--fg-soft)]">
              <input
                type="checkbox"
                className="accent-[var(--accent)]"
                checked={form.home.tiersSection.enabled !== false}
                onChange={(e) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      tiersSection: {
                        ...form.home.tiersSection,
                        enabled: e.target.checked,
                      },
                    },
                  })
                }
              />
              Show programme cards (when Funnel engine is off, or if Funnel layout ticks Tiers)
            </label>
            <Field label="Heading">
              <Text
                value={form.home.tiersSection.heading}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      tiersSection: {
                        ...form.home.tiersSection,
                        heading: v,
                      },
                    },
                  })
                }
              />
            </Field>
            <Field label="Subhead">
              <Text
                multiline
                value={form.home.tiersSection.subhead}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      tiersSection: {
                        ...form.home.tiersSection,
                        subhead: v,
                      },
                    },
                  })
                }
              />
            </Field>
            <label className="flex items-center gap-2 text-sm text-[var(--fg-soft)]">
              <input
                type="checkbox"
                className="accent-[var(--accent)]"
                checked={form.home.tiersSection.offer.enabled}
                onChange={(e) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      tiersSection: {
                        ...form.home.tiersSection,
                        offer: {
                          ...form.home.tiersSection.offer,
                          enabled: e.target.checked,
                        },
                      },
                    },
                  })
                }
              />
              Challenge savings price block (leave figures blank until signed off)
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Anchor price (struck through)">
                <Text
                  value={form.home.tiersSection.offer.anchorPrice}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        tiersSection: {
                          ...form.home.tiersSection,
                          offer: {
                            ...form.home.tiersSection.offer,
                            anchorPrice: v,
                          },
                        },
                      },
                    })
                  }
                />
              </Field>
              <Field label="Live price">
                <Text
                  value={form.home.tiersSection.offer.livePrice}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        tiersSection: {
                          ...form.home.tiersSection,
                          offer: {
                            ...form.home.tiersSection.offer,
                            livePrice: v,
                          },
                        },
                      },
                    })
                  }
                />
              </Field>
              <Field label="Total saving">
                <Text
                  value={form.home.tiersSection.offer.totalSaving}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        tiersSection: {
                          ...form.home.tiersSection,
                          offer: {
                            ...form.home.tiersSection.offer,
                            totalSaving: v,
                          },
                        },
                      },
                    })
                  }
                />
              </Field>
              <Field label="Addon label">
                <Text
                  value={form.home.tiersSection.offer.addonLabel}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        tiersSection: {
                          ...form.home.tiersSection,
                          offer: {
                            ...form.home.tiersSection.offer,
                            addonLabel: v,
                          },
                        },
                      },
                    })
                  }
                />
              </Field>
              <Field label="Addon VALUE">
                <Text
                  value={form.home.tiersSection.offer.addonValue}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        tiersSection: {
                          ...form.home.tiersSection,
                          offer: {
                            ...form.home.tiersSection.offer,
                            addonValue: v,
                          },
                        },
                      },
                    })
                  }
                />
              </Field>
              <Field label="Addon price">
                <Text
                  value={form.home.tiersSection.offer.addonPrice}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        tiersSection: {
                          ...form.home.tiersSection,
                          offer: {
                            ...form.home.tiersSection.offer,
                            addonPrice: v,
                          },
                        },
                      },
                    })
                  }
                />
              </Field>
            </div>
            <Field label="Recurring terms">
              <Text
                multiline
                value={form.home.tiersSection.offer.recurringTerms}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      tiersSection: {
                        ...form.home.tiersSection,
                        offer: {
                          ...form.home.tiersSection.offer,
                          recurringTerms: v,
                        },
                      },
                    },
                  })
                }
              />
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Offer end">
                <Text
                  value={form.home.tiersSection.offer.offerEnd}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        tiersSection: {
                          ...form.home.tiersSection,
                          offer: {
                            ...form.home.tiersSection.offer,
                            offerEnd: v,
                          },
                        },
                      },
                    })
                  }
                />
              </Field>
              <Field label="Places remaining">
                <Text
                  value={form.home.tiersSection.offer.placesRemaining}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        tiersSection: {
                          ...form.home.tiersSection,
                          offer: {
                            ...form.home.tiersSection.offer,
                            placesRemaining: v,
                          },
                        },
                      },
                    })
                  }
                />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-[var(--fg-soft)]">
              <input
                type="checkbox"
                className="accent-[var(--accent)]"
                checked={form.home.tiersSection.guarantee.enabled}
                onChange={(e) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      tiersSection: {
                        ...form.home.tiersSection,
                        guarantee: {
                          ...form.home.tiersSection.guarantee,
                          enabled: e.target.checked,
                        },
                      },
                    },
                  })
                }
              />
              Guarantee / trust lines under Challenge CTA
            </label>
            <Field label="Trust line">
              <Text
                value={form.home.tiersSection.guarantee.trustLine}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      tiersSection: {
                        ...form.home.tiersSection,
                        guarantee: {
                          ...form.home.tiersSection.guarantee,
                          trustLine: v,
                        },
                      },
                    },
                  })
                }
              />
            </Field>
            <Field label="Guarantee">
              <Text
                value={form.home.tiersSection.guarantee.guarantee}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      tiersSection: {
                        ...form.home.tiersSection,
                        guarantee: {
                          ...form.home.tiersSection.guarantee,
                          guarantee: v,
                        },
                      },
                    },
                  })
                }
              />
            </Field>
          </Section>

          <Section title="FAQ">
            <label className="flex items-center gap-2 text-sm text-[var(--fg-soft)]">
              <input
                type="checkbox"
                className="accent-[var(--accent)]"
                checked={form.home.faq.enabled}
                onChange={(e) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      faq: { ...form.home.faq, enabled: e.target.checked },
                    },
                  })
                }
              />
              Enabled
            </label>
            <Field label="Heading">
              <Text
                value={form.home.faq.heading}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      faq: { ...form.home.faq, heading: v },
                    },
                  })
                }
              />
            </Field>
            {form.home.faq.items.map((item, i) => (
              <div
                key={item.id}
                className="space-y-3 rounded-md border border-[var(--border)] p-3"
              >
                <Field label="Question">
                  <Text
                    value={item.question}
                    onChange={(v) => {
                      const items = form.home.faq.items.map((row, idx) =>
                        idx === i ? { ...row, question: v } : row,
                      );
                      setForm({
                        ...form,
                        home: {
                          ...form.home,
                          faq: { ...form.home.faq, items },
                        },
                      });
                    }}
                  />
                </Field>
                <Field label="Answer">
                  <Text
                    multiline
                    value={item.answer}
                    onChange={(v) => {
                      const items = form.home.faq.items.map((row, idx) =>
                        idx === i ? { ...row, answer: v } : row,
                      );
                      setForm({
                        ...form,
                        home: {
                          ...form.home,
                          faq: { ...form.home.faq, items },
                        },
                      });
                    }}
                  />
                </Field>
                <RemoveBlock
                  onClick={() =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        faq: {
                          ...form.home.faq,
                          items: form.home.faq.items.filter((_, idx) => idx !== i),
                        },
                      },
                    })
                  }
                />
              </div>
            ))}
            <AddBlock
              label="Add FAQ"
              onClick={() =>
                setForm({
                  ...form,
                  home: {
                    ...form.home,
                    faq: {
                      ...form.home.faq,
                      items: [
                        ...form.home.faq.items,
                        { id: cmsId("faq"), question: "", answer: "" },
                      ],
                    },
                  },
                })
              }
            />
          </Section>

          <Section title="Final CTA">
            <label className="flex items-center gap-2 text-sm text-[var(--fg-soft)]">
              <input
                type="checkbox"
                className="accent-[var(--accent)]"
                checked={form.home.finalCta.enabled}
                onChange={(e) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      finalCta: {
                        ...form.home.finalCta,
                        enabled: e.target.checked,
                      },
                    },
                  })
                }
              />
              Enabled
            </label>
            <Field label="Title">
              <Text
                multiline
                value={form.home.finalCta.title}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      finalCta: { ...form.home.finalCta, title: v },
                    },
                  })
                }
              />
            </Field>
            <Field label="Body">
              <Text
                multiline
                value={form.home.finalCta.body}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      finalCta: { ...form.home.finalCta, body: v },
                    },
                  })
                }
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Primary label">
                <Text
                  value={form.home.finalCta.primary.label}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        finalCta: {
                          ...form.home.finalCta,
                          primary: {
                            ...form.home.finalCta.primary,
                            label: v,
                          },
                        },
                      },
                    })
                  }
                />
              </Field>
              <Field label="Primary href">
                <Text
                  value={form.home.finalCta.primary.href}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        finalCta: {
                          ...form.home.finalCta,
                          primary: {
                            ...form.home.finalCta.primary,
                            href: v,
                          },
                        },
                      },
                    })
                  }
                />
              </Field>
              <Field label="Secondary label">
                <Text
                  value={form.home.finalCta.secondary.label}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        finalCta: {
                          ...form.home.finalCta,
                          secondary: {
                            ...form.home.finalCta.secondary,
                            label: v,
                          },
                        },
                      },
                    })
                  }
                />
              </Field>
              <Field label="Secondary href">
                <Text
                  value={form.home.finalCta.secondary.href}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        finalCta: {
                          ...form.home.finalCta,
                          secondary: {
                            ...form.home.finalCta.secondary,
                            href: v,
                          },
                        },
                      },
                    })
                  }
                />
              </Field>
            </div>
          </Section>

          <Section title="Transformation cards">
            <p className="text-xs text-[var(--muted)]">
              Upload a Before photo and an After photo on each card. On the
              live page they sit on one card — hover or drag to compare.
            </p>
            <label className="flex items-center gap-2 text-sm text-[var(--fg-soft)]">
              <input
                type="checkbox"
                className="accent-[var(--accent)]"
                checked={form.home.testimonials.enabled}
                onChange={(e) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      testimonials: {
                        ...form.home.testimonials,
                        enabled: e.target.checked,
                      },
                    },
                  })
                }
              />
              Enabled
            </label>
            <Field label="Heading">
              <Text
                value={form.home.testimonials.heading}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      testimonials: { ...form.home.testimonials, heading: v },
                    },
                  })
                }
              />
            </Field>
            <Field label="Subhead">
              <Text
                multiline
                value={form.home.testimonials.subhead}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      testimonials: { ...form.home.testimonials, subhead: v },
                    },
                  })
                }
              />
            </Field>
            {form.home.testimonials.items.map((item, i) => (
              <div
                key={item.id}
                className="space-y-3 rounded-md border border-[var(--border)] p-3"
              >
                <label className="flex items-center gap-2 text-sm text-[var(--fg-soft)]">
                  <input
                    type="checkbox"
                    className="accent-[var(--accent)]"
                    checked={item.enabled}
                    onChange={(e) => {
                      const items = form.home.testimonials.items.map(
                        (row, idx) =>
                          idx === i
                            ? { ...row, enabled: e.target.checked }
                            : row,
                      );
                      setForm({
                        ...form,
                        home: {
                          ...form.home,
                          testimonials: { ...form.home.testimonials, items },
                        },
                      });
                    }}
                  />
                  Enabled
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <AssetUpload
                    label="Before image"
                    folder="images"
                    value={item.beforeImageUrl}
                    onChange={(url) => {
                      const items = form.home.testimonials.items.map(
                        (row, idx) =>
                          idx === i ? { ...row, beforeImageUrl: url } : row,
                      );
                      setForm({
                        ...form,
                        home: {
                          ...form.home,
                          testimonials: { ...form.home.testimonials, items },
                        },
                      });
                    }}
                  />
                  <AssetUpload
                    label="After image"
                    folder="images"
                    value={item.imageUrl}
                    onChange={(url) => {
                      const items = form.home.testimonials.items.map(
                        (row, idx) =>
                          idx === i ? { ...row, imageUrl: url } : row,
                      );
                      setForm({
                        ...form,
                        home: {
                          ...form.home,
                          testimonials: { ...form.home.testimonials, items },
                        },
                      });
                    }}
                  />
                </div>
                {item.beforeImageUrl && item.imageUrl ? (
                  <p className="text-xs text-[var(--accent)]">
                    Hover compare is on — both images will play on one card.
                  </p>
                ) : (
                  <p className="text-xs text-[var(--muted)]">
                    Add both photos to turn on the before/after hover.
                  </p>
                )}
                <Field label="Quote">
                  <Text
                    multiline
                    value={item.quote}
                    onChange={(v) => {
                      const items = form.home.testimonials.items.map(
                        (row, idx) => (idx === i ? { ...row, quote: v } : row),
                      );
                      setForm({
                        ...form,
                        home: {
                          ...form.home,
                          testimonials: { ...form.home.testimonials, items },
                        },
                      });
                    }}
                  />
                </Field>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Name">
                    <Text
                      value={item.name}
                      onChange={(v) => {
                        const items = form.home.testimonials.items.map(
                          (row, idx) => (idx === i ? { ...row, name: v } : row),
                        );
                        setForm({
                          ...form,
                          home: {
                            ...form.home,
                            testimonials: { ...form.home.testimonials, items },
                          },
                        });
                      }}
                    />
                  </Field>
                  <Field
                    label="Result line"
                    hint='Shows under the name. e.g. Lost 12kg or +40kg deadlift'
                  >
                    <Text
                      value={item.result}
                      onChange={(v) => {
                        const items = form.home.testimonials.items.map(
                          (row, idx) =>
                            idx === i ? { ...row, result: v } : row,
                        );
                        setForm({
                          ...form,
                          home: {
                            ...form.home,
                            testimonials: { ...form.home.testimonials, items },
                          },
                        });
                      }}
                    />
                  </Field>
                </div>
                <Field label="Image alt">
                  <Text
                    value={item.imageAlt}
                    onChange={(v) => {
                      const items = form.home.testimonials.items.map(
                        (row, idx) =>
                          idx === i ? { ...row, imageAlt: v } : row,
                      );
                      setForm({
                        ...form,
                        home: {
                          ...form.home,
                          testimonials: { ...form.home.testimonials, items },
                        },
                      });
                    }}
                  />
                </Field>
                <button
                  type="button"
                  className="text-xs font-semibold text-red-400"
                  onClick={() =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        testimonials: {
                          ...form.home.testimonials,
                          items: form.home.testimonials.items.filter(
                            (_, idx) => idx !== i,
                          ),
                        },
                      },
                    })
                  }
                >
                  Remove card
                </button>
              </div>
            ))}
            <button
              type="button"
              className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--fg)]"
              onClick={() =>
                setForm({
                  ...form,
                  home: {
                    ...form.home,
                    testimonials: {
                      ...form.home.testimonials,
                      items: [
                        ...form.home.testimonials.items,
                        {
                          id: `t-${Date.now()}`,
                          enabled: true,
                          quote: "",
                          name: "",
                          result: "",
                          imageUrl: "",
                          beforeImageUrl: "",
                          imageAlt: "",
                        },
                      ],
                    },
                  },
                })
              }
            >
              Add transformation
            </button>
          </Section>

          <Section title="Footer disclaimer">
            <label className="flex items-center gap-2 text-sm text-[var(--fg-soft)]">
              <input
                type="checkbox"
                className="accent-[var(--accent)]"
                checked={form.home.disclaimer.enabled}
                onChange={(e) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      disclaimer: {
                        ...form.home.disclaimer,
                        enabled: e.target.checked,
                      },
                    },
                  })
                }
              />
              Enabled
            </label>
            <Field label="Disclaimer text">
              <Text
                multiline
                value={form.home.disclaimer.text}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      disclaimer: { ...form.home.disclaimer, text: v },
                    },
                  })
                }
              />
            </Field>
          </Section>

          <Section title="Popups and sticky bar">
            <p className="text-xs text-[var(--muted)]">
              Email popup uses the provider on Integrations. Reviews popup uses
              the testimonials above. Neither fires on page load — reviews wait
              for 50% scroll plus exit intent so the hero stays clear.
            </p>
            <label className="flex items-center gap-2 text-sm text-[var(--fg-soft)]">
              <input
                type="checkbox"
                className="accent-[var(--accent)]"
                checked={form.home.popups.email.enabled}
                onChange={(e) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      popups: {
                        ...form.home.popups,
                        email: {
                          ...form.home.popups.email,
                          enabled: e.target.checked,
                        },
                      },
                    },
                  })
                }
              />
              Email signup popup
            </label>
            <Field label="Email popup title">
              <Text
                value={form.home.popups.email.title}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      popups: {
                        ...form.home.popups,
                        email: { ...form.home.popups.email, title: v },
                      },
                    },
                  })
                }
              />
            </Field>
            <Field label="Email popup body">
              <Text
                multiline
                value={form.home.popups.email.body}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      popups: {
                        ...form.home.popups,
                        email: { ...form.home.popups.email, body: v },
                      },
                    },
                  })
                }
              />
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Placeholder">
                <Text
                  value={form.home.popups.email.placeholder}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        popups: {
                          ...form.home.popups,
                          email: { ...form.home.popups.email, placeholder: v },
                        },
                      },
                    })
                  }
                />
              </Field>
              <Field label="Button">
                <Text
                  value={form.home.popups.email.cta}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        popups: {
                          ...form.home.popups,
                          email: { ...form.home.popups.email, cta: v },
                        },
                      },
                    })
                  }
                />
              </Field>
            </div>
            <Field label="Success message">
              <Text
                value={form.home.popups.email.success}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      popups: {
                        ...form.home.popups,
                        email: { ...form.home.popups.email, success: v },
                      },
                    },
                  })
                }
              />
            </Field>
            <Field label="Privacy line">
              <Text
                multiline
                value={form.home.popups.email.privacy}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      popups: {
                        ...form.home.popups,
                        email: { ...form.home.popups.email, privacy: v },
                      },
                    },
                  })
                }
              />
            </Field>
            <Field label="Email popup delay (ms)">
              <input
                type="number"
                min={0}
                className={inputClass}
                value={form.home.popups.email.delayMs}
                onChange={(e) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      popups: {
                        ...form.home.popups,
                        email: {
                          ...form.home.popups.email,
                          delayMs: Number(e.target.value),
                        },
                      },
                    },
                  })
                }
              />
            </Field>
            <label className="flex items-center gap-2 text-sm text-[var(--fg-soft)]">
              <input
                type="checkbox"
                className="accent-[var(--accent)]"
                checked={form.home.popups.reviews.enabled}
                onChange={(e) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      popups: {
                        ...form.home.popups,
                        reviews: {
                          ...form.home.popups.reviews,
                          enabled: e.target.checked,
                        },
                      },
                    },
                  })
                }
              />
              Reviews popup
            </label>
            <Field label="Reviews popup title">
              <Text
                value={form.home.popups.reviews.title}
                onChange={(v) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      popups: {
                        ...form.home.popups,
                        reviews: { ...form.home.popups.reviews, title: v },
                      },
                    },
                  })
                }
              />
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Reviews popup CTA">
                <Text
                  value={form.home.popups.reviews.ctaLabel}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        popups: {
                          ...form.home.popups,
                          reviews: {
                            ...form.home.popups.reviews,
                            ctaLabel: v,
                          },
                        },
                      },
                    })
                  }
                />
              </Field>
              <Field label="Reviews popup href">
                <Text
                  value={form.home.popups.reviews.ctaHref}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        popups: {
                          ...form.home.popups,
                          reviews: {
                            ...form.home.popups.reviews,
                            ctaHref: v,
                          },
                        },
                      },
                    })
                  }
                />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-[var(--fg-soft)]">
              <input
                type="checkbox"
                className="accent-[var(--accent)]"
                checked={form.home.stickyCta.enabled}
                onChange={(e) =>
                  setForm({
                    ...form,
                    home: {
                      ...form.home,
                      stickyCta: {
                        ...form.home.stickyCta,
                        enabled: e.target.checked,
                      },
                    },
                  })
                }
              />
              Sticky apply bar (shows after the hero scrolls out of view)
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Sticky label">
                <Text
                  value={form.home.stickyCta.label}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        stickyCta: { ...form.home.stickyCta, label: v },
                      },
                    })
                  }
                />
              </Field>
              <Field label="Sticky href">
                <Text
                  value={form.home.stickyCta.href}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      home: {
                        ...form.home,
                        stickyCta: { ...form.home.stickyCta, href: v },
                      },
                    })
                  }
                />
              </Field>
            </div>
          </Section>

          <Section title="Image banner sections">
            <p className="text-xs text-[var(--muted)]">
              Each section is independent. Upload images to{" "}
              <code className="text-[var(--fg-soft)]">public/assets/images</code>
              , pick a page slot, enable, then Save CMS.
            </p>
            {form.home.imageSections.map((section, si) => (
              <div
                key={section.id}
                className="space-y-3 rounded-md border border-[var(--border)] p-3"
              >
                <label className="flex items-center gap-2 text-sm text-[var(--fg-soft)]">
                  <input
                    type="checkbox"
                    className="accent-[var(--accent)]"
                    checked={section.enabled}
                    onChange={(e) =>
                      updateImageSection(si, { enabled: e.target.checked })
                    }
                  />
                  Enabled — {section.id}
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Heading">
                    <Text
                      value={section.heading}
                      onChange={(v) => updateImageSection(si, { heading: v })}
                    />
                  </Field>
                  <Field label="Page slot">
                    <select
                      className={inputClass}
                      value={section.slot}
                      onChange={(e) =>
                        updateImageSection(si, {
                          slot: e.target.value as CmsMediaSlot,
                        })
                      }
                    >
                      {CMS_MEDIA_SLOT_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label="Subhead">
                  <Text
                    multiline
                    value={section.subhead}
                    onChange={(v) => updateImageSection(si, { subhead: v })}
                  />
                </Field>
                <Field label="Layout">
                  <select
                    className={inputClass}
                    value={section.layout}
                    onChange={(e) =>
                      updateImageSection(si, {
                        layout: e.target.value as CmsImageSection["layout"],
                      })
                    }
                  >
                    <option value="full">Full-bleed banners</option>
                    <option value="split">Split (2-up)</option>
                    <option value="grid">Grid</option>
                  </select>
                </Field>

                {section.images.map((img, ii) => (
                  <div
                    key={img.id}
                    className="space-y-3 rounded-md border border-dashed border-[var(--border)] p-3"
                  >
                    <label className="flex items-center gap-2 text-sm text-[var(--fg-soft)]">
                      <input
                        type="checkbox"
                        className="accent-[var(--accent)]"
                        checked={img.enabled}
                        onChange={(e) => {
                          const images = section.images.map((row, idx) =>
                            idx === ii
                              ? { ...row, enabled: e.target.checked }
                              : row,
                          );
                          updateImageSection(si, { images });
                        }}
                      />
                      Image enabled
                    </label>
                    <AssetUpload
                      label="Banner image"
                      folder="images"
                      value={img.url}
                      onChange={(url) => {
                        const images = section.images.map((row, idx) =>
                          idx === ii ? { ...row, url } : row,
                        );
                        updateImageSection(si, { images });
                      }}
                    />
                    <Field label="Alt text">
                      <Text
                        value={img.alt}
                        onChange={(v) => {
                          const images = section.images.map((row, idx) =>
                            idx === ii ? { ...row, alt: v } : row,
                          );
                          updateImageSection(si, { images });
                        }}
                      />
                    </Field>
                    <Field label="Caption">
                      <Text
                        value={img.caption}
                        onChange={(v) => {
                          const images = section.images.map((row, idx) =>
                            idx === ii ? { ...row, caption: v } : row,
                          );
                          updateImageSection(si, { images });
                        }}
                      />
                    </Field>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Field label="CTA label">
                        <Text
                          value={img.cta.label}
                          onChange={(v) => {
                            const images = section.images.map((row, idx) =>
                              idx === ii
                                ? { ...row, cta: { ...row.cta, label: v } }
                                : row,
                            );
                            updateImageSection(si, { images });
                          }}
                        />
                      </Field>
                      <Field label="CTA href">
                        <Text
                          value={img.cta.href}
                          onChange={(v) => {
                            const images = section.images.map((row, idx) =>
                              idx === ii
                                ? { ...row, cta: { ...row.cta, href: v } }
                                : row,
                            );
                            updateImageSection(si, { images });
                          }}
                        />
                      </Field>
                    </div>
                    <button
                      type="button"
                      className="text-xs font-semibold text-red-400"
                      onClick={() => {
                        const images = section.images.filter((_, idx) => idx !== ii);
                        updateImageSection(si, { images });
                      }}
                    >
                      Remove image
                    </button>
                  </div>
                ))}

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--fg)]"
                    onClick={() =>
                      updateImageSection(si, {
                        images: [
                          ...section.images,
                          {
                            id: `img-${Date.now()}`,
                            enabled: true,
                            url: "",
                            alt: "",
                            caption: "",
                            cta: { label: "", href: "" },
                          },
                        ],
                      })
                    }
                  >
                    Add image to section
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-semibold text-red-400"
                    onClick={() =>
                      setForm({
                        ...form,
                        home: {
                          ...form.home,
                          imageSections: form.home.imageSections.filter(
                            (_, idx) => idx !== si,
                          ),
                        },
                      })
                    }
                  >
                    Delete section
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--fg)]"
              onClick={() =>
                setForm({
                  ...form,
                  home: {
                    ...form.home,
                    imageSections: [
                      ...form.home.imageSections,
                      {
                        id: `image-section-${Date.now()}`,
                        enabled: true,
                        slot: "after-hero",
                        heading: "New image section",
                        subhead: "",
                        layout: "full",
                        images: [
                          {
                            id: `img-${Date.now()}`,
                            enabled: true,
                            url: "",
                            alt: "",
                            caption: "",
                            cta: { label: "Book Your Call", href: "/book?tier=pro" },
                          },
                        ],
                      },
                    ],
                  },
                })
              }
            >
              Add image section
            </button>
          </Section>

          <Section title="Video sections (YouTube on-site)">
            <p className="text-xs text-[var(--muted)]">
              Paste a YouTube link. Visitors click play and watch in an embed —
              they stay on this site (youtube-nocookie).
            </p>
            {form.home.videoSections.map((section, si) => (
              <div
                key={section.id}
                className="space-y-3 rounded-md border border-[var(--border)] p-3"
              >
                <label className="flex items-center gap-2 text-sm text-[var(--fg-soft)]">
                  <input
                    type="checkbox"
                    className="accent-[var(--accent)]"
                    checked={section.enabled}
                    onChange={(e) =>
                      updateVideoSection(si, { enabled: e.target.checked })
                    }
                  />
                  Enabled — {section.id}
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Heading">
                    <Text
                      value={section.heading}
                      onChange={(v) => updateVideoSection(si, { heading: v })}
                    />
                  </Field>
                  <Field label="Page slot">
                    <select
                      className={inputClass}
                      value={section.slot}
                      onChange={(e) =>
                        updateVideoSection(si, {
                          slot: e.target.value as CmsMediaSlot,
                        })
                      }
                    >
                      {CMS_MEDIA_SLOT_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label="Subhead">
                  <Text
                    multiline
                    value={section.subhead}
                    onChange={(v) => updateVideoSection(si, { subhead: v })}
                  />
                </Field>

                {section.videos.map((video, vi) => (
                  <div
                    key={video.id}
                    className="space-y-3 rounded-md border border-dashed border-[var(--border)] p-3"
                  >
                    <label className="flex items-center gap-2 text-sm text-[var(--fg-soft)]">
                      <input
                        type="checkbox"
                        className="accent-[var(--accent)]"
                        checked={video.enabled}
                        onChange={(e) => {
                          const videos = section.videos.map((row, idx) =>
                            idx === vi
                              ? { ...row, enabled: e.target.checked }
                              : row,
                          );
                          updateVideoSection(si, { videos });
                        }}
                      />
                      Video enabled
                    </label>
                    <Field label="Title">
                      <Text
                        value={video.title}
                        onChange={(v) => {
                          const videos = section.videos.map((row, idx) =>
                            idx === vi ? { ...row, title: v } : row,
                          );
                          updateVideoSection(si, { videos });
                        }}
                      />
                    </Field>
                    <Field
                      label="YouTube video ID"
                      hint="11-character ID. Images must be uploaded."
                    >
                      <Text
                        value={video.youtubeUrl}
                        onChange={(v) => {
                          const videos = section.videos.map((row, idx) =>
                            idx === vi ? { ...row, youtubeUrl: v } : row,
                          );
                          updateVideoSection(si, { videos });
                        }}
                      />
                    </Field>
                    <Field label="Body / caption">
                      <Text
                        multiline
                        value={video.body}
                        onChange={(v) => {
                          const videos = section.videos.map((row, idx) =>
                            idx === vi ? { ...row, body: v } : row,
                          );
                          updateVideoSection(si, { videos });
                        }}
                      />
                    </Field>
                    <AssetUpload
                      label="Custom thumbnail (optional)"
                      folder="thumbnails"
                      value={video.thumbnailUrl}
                      onChange={(url) => {
                        const videos = section.videos.map((row, idx) =>
                          idx === vi ? { ...row, thumbnailUrl: url } : row,
                        );
                        updateVideoSection(si, { videos });
                      }}
                    />
                    <button
                      type="button"
                      className="text-xs font-semibold text-red-400"
                      onClick={() => {
                        const videos = section.videos.filter((_, idx) => idx !== vi);
                        updateVideoSection(si, { videos });
                      }}
                    >
                      Remove video
                    </button>
                  </div>
                ))}

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--fg)]"
                    onClick={() =>
                      updateVideoSection(si, {
                        videos: [
                          ...section.videos,
                          {
                            id: `vid-${Date.now()}`,
                            enabled: true,
                            title: "New video",
                            body: "",
                            youtubeUrl: "",
                            thumbnailUrl: "",
                          },
                        ],
                      })
                    }
                  >
                    Add video to section
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-semibold text-red-400"
                    onClick={() =>
                      setForm({
                        ...form,
                        home: {
                          ...form.home,
                          videoSections: form.home.videoSections.filter(
                            (_, idx) => idx !== si,
                          ),
                        },
                      })
                    }
                  >
                    Delete section
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--fg)]"
              onClick={() =>
                setForm({
                  ...form,
                  home: {
                    ...form.home,
                    videoSections: [
                      ...form.home.videoSections,
                      {
                        id: `video-section-${Date.now()}`,
                        enabled: true,
                        slot: "after-how",
                        heading: "New video section",
                        subhead: "",
                        videos: [
                          {
                            id: `vid-${Date.now()}`,
                            enabled: true,
                            title: "Video title",
                            body: "",
                            youtubeUrl: "",
                            thumbnailUrl: "",
                          },
                        ],
                      },
                    ],
                  },
                })
              }
            >
              Add video section
            </button>
          </Section>
        </div>
      ) : null}

      {tab === "tiers" ? (
        <div className="space-y-6">
          {form.tiers.map((tier, i) => (
            <Section key={tier.id} title={`Tier: ${tier.name || tier.id}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm text-[var(--fg-soft)]">
                  <input
                    type="checkbox"
                    className="accent-[var(--accent)]"
                    checked={tier.enabled}
                    onChange={(e) =>
                      updateTier(i, { enabled: e.target.checked })
                    }
                  />
                  Enabled on landing page
                </label>
                <RemoveBlock
                  label="Remove programme"
                  onClick={() => removeTier(i)}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-[var(--fg-soft)]">
                <input
                  type="checkbox"
                  className="accent-[var(--accent)]"
                  checked={tier.highlight}
                  onChange={(e) =>
                    updateTier(i, { highlight: e.target.checked })
                  }
                />
                Highlight (sell tier)
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Name">
                  <Text
                    value={tier.name}
                    onChange={(v) => updateTier(i, { name: v })}
                  />
                </Field>
                <Field label="Badge">
                  <Text
                    value={tier.badge}
                    onChange={(v) => updateTier(i, { badge: v })}
                  />
                </Field>
                <Field label="Subhead">
                  <Text
                    value={tier.subhead}
                    onChange={(v) => updateTier(i, { subhead: v })}
                  />
                </Field>
                <Field label="Apply badge text (book CTAs)">
                  <Text
                    value={tier.applyBadge}
                    onChange={(v) => updateTier(i, { applyBadge: v })}
                  />
                </Field>
              </div>
              <LinesEditor
                label="Body lines"
                value={tier.body}
                onChange={(v) => updateTier(i, { body: v })}
              />
              <LinesEditor
                label="Includes"
                value={tier.includes}
                onChange={(v) => updateTier(i, { includes: v })}
              />
              <Field label="CTA kind">
                <select
                  className={inputClass}
                  value={tier.cta.kind}
                  onChange={(e) => {
                    const kind = e.target.value as CmsTier["cta"]["kind"];
                    if (kind === "book") {
                      updateTier(i, {
                        cta: {
                          kind: "book",
                          label: tier.cta.label,
                          bookTier:
                            tier.id === "elite" ? "elite" : "pro",
                        },
                      });
                    } else if (kind === "checkout") {
                      updateTier(i, {
                        cta: {
                          kind: "checkout",
                          label: tier.cta.label,
                          href:
                            tier.cta.kind === "checkout" ||
                            tier.cta.kind === "link"
                              ? tier.cta.href
                              : "/challenge",
                        },
                      });
                    } else {
                      updateTier(i, {
                        cta: {
                          kind: "link",
                          label: tier.cta.label,
                          href:
                            tier.cta.kind === "checkout" ||
                            tier.cta.kind === "link"
                              ? tier.cta.href
                              : "/challenge",
                        },
                      });
                    }
                  }}
                >
                  <option value="book">Book call</option>
                  <option value="checkout">Checkout</option>
                  <option value="link">Link</option>
                </select>
              </Field>
              <Field label="CTA label">
                <Text
                  value={tier.cta.label}
                  onChange={(v) => {
                    if (tier.cta.kind === "book") {
                      updateTier(i, {
                        cta: {
                          kind: "book",
                          label: v,
                          bookTier: tier.cta.bookTier,
                        },
                      });
                    } else if (tier.cta.kind === "checkout") {
                      updateTier(i, {
                        cta: {
                          kind: "checkout",
                          label: v,
                          href: tier.cta.href,
                        },
                      });
                    } else {
                      updateTier(i, {
                        cta: { kind: "link", label: v, href: tier.cta.href },
                      });
                    }
                  }}
                />
              </Field>
              {tier.cta.kind !== "book" ? (
                <Field label="CTA href">
                  <Text
                    value={tier.cta.href}
                    onChange={(v) => {
                      if (tier.cta.kind === "checkout") {
                        updateTier(i, {
                          cta: {
                            kind: "checkout",
                            label: tier.cta.label,
                            href: v,
                          },
                        });
                      } else if (tier.cta.kind === "link") {
                        updateTier(i, {
                          cta: {
                            kind: "link",
                            label: tier.cta.label,
                            href: v,
                          },
                        });
                      }
                    }}
                  />
                </Field>
              ) : (
                <Field label="Book tier">
                  <select
                    className={inputClass}
                    value={tier.cta.bookTier}
                    onChange={(e) =>
                      updateTier(i, {
                        cta: {
                          kind: "book",
                          label: tier.cta.label,
                          bookTier: e.target.value as "pro" | "elite",
                        },
                      })
                    }
                  >
                    <option value="pro">pro</option>
                    <option value="elite">elite</option>
                  </select>
                </Field>
              )}
            </Section>
          ))}
          <AddBlock label="Add programme card" onClick={addTier} />
        </div>
      ) : null}

      {tab === "questionnaire" ? (
        <div className="space-y-6">
          <Section title="Page chrome">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Back label">
                <Text
                  value={form.questionnaire.back.label}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      questionnaire: {
                        ...form.questionnaire,
                        back: { ...form.questionnaire.back, label: v },
                      },
                    })
                  }
                />
              </Field>
              <Field label="Back href">
                <Text
                  value={form.questionnaire.back.href}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      questionnaire: {
                        ...form.questionnaire,
                        back: { ...form.questionnaire.back, href: v },
                      },
                    })
                  }
                />
              </Field>
            </div>
            <Field label="Title">
              <Text
                value={form.questionnaire.title}
                onChange={(v) =>
                  setForm({
                    ...form,
                    questionnaire: {
                      ...form.questionnaire,
                      title: v,
                    },
                  })
                }
              />
            </Field>
            <Field label="Intro (mobile stepped)">
              <Text
                multiline
                value={form.questionnaire.introMobile}
                onChange={(v) =>
                  setForm({
                    ...form,
                    questionnaire: {
                      ...form.questionnaire,
                      introMobile: v,
                    },
                  })
                }
              />
            </Field>
            <Field label="Intro (desktop)">
              <Text
                multiline
                value={form.questionnaire.introDesktop}
                onChange={(v) =>
                  setForm({
                    ...form,
                    questionnaire: {
                      ...form.questionnaire,
                      introDesktop: v,
                    },
                  })
                }
              />
            </Field>
          </Section>
          <Section title="Options (one per line)">
            <LinesEditor
              label="Goals"
              value={form.questionnaire.goals}
              onChange={(v) =>
                setForm({
                  ...form,
                  questionnaire: { ...form.questionnaire, goals: v },
                })
              }
            />
            <LinesEditor
              label="Training now"
              value={form.questionnaire.trainingNow}
              onChange={(v) =>
                setForm({
                  ...form,
                  questionnaire: {
                    ...form.questionnaire,
                    trainingNow: v,
                  },
                })
              }
            />
            <LinesEditor
              label="Days commit"
              value={form.questionnaire.daysCommit}
              onChange={(v) =>
                setForm({
                  ...form,
                  questionnaire: {
                    ...form.questionnaire,
                    daysCommit: v,
                  },
                })
              }
            />
            <LinesEditor
              label="Investment answers"
              value={form.questionnaire.investment}
              onChange={(v) =>
                setForm({
                  ...form,
                  questionnaire: {
                    ...form.questionnaire,
                    investment: v,
                  },
                })
              }
            />
            <LinesEditor
              label="Step titles"
              value={form.questionnaire.stepTitles}
              onChange={(v) =>
                setForm({
                  ...form,
                  questionnaire: {
                    ...form.questionnaire,
                    stepTitles: v,
                  },
                })
              }
            />
          </Section>
          <Section title="Copy blocks">
            <Field label="Q6 helper">
              <Text
                value={form.questionnaire.step6Helper}
                onChange={(v) =>
                  setForm({
                    ...form,
                    questionnaire: {
                      ...form.questionnaire,
                      step6Helper: v,
                    },
                  })
                }
              />
            </Field>
            <Field label="Q9 prompt ({price} token)">
              <Text
                multiline
                value={form.questionnaire.step9Prompt}
                onChange={(v) =>
                  setForm({
                    ...form,
                    questionnaire: {
                      ...form.questionnaire,
                      step9Prompt: v,
                    },
                  })
                }
              />
            </Field>
            <Field label="Medical privacy line">
              <Text
                multiline
                value={form.questionnaire.medicalPrivacy}
                onChange={(v) =>
                  setForm({
                    ...form,
                    questionnaire: {
                      ...form.questionnaire,
                      medicalPrivacy: v,
                    },
                  })
                }
              />
            </Field>
            <Field label="Consent label ({tier} token)">
              <Text
                multiline
                value={form.questionnaire.consentLabel}
                onChange={(v) =>
                  setForm({
                    ...form,
                    questionnaire: {
                      ...form.questionnaire,
                      consentLabel: v,
                    },
                  })
                }
              />
            </Field>
            <Field label="Consent WhatsApp note">
              <Text
                multiline
                value={form.questionnaire.consentWhatsappNote}
                onChange={(v) =>
                  setForm({
                    ...form,
                    questionnaire: {
                      ...form.questionnaire,
                      consentWhatsappNote: v,
                    },
                  })
                }
              />
            </Field>
          </Section>
          <Section title="Buttons">
            {(
              [
                "back",
                "continue",
                "submit",
                "submitting",
              ] as const
            ).map((key) => (
              <Field key={key} label={key}>
                <Text
                  value={form.questionnaire.buttons[key]}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      questionnaire: {
                        ...form.questionnaire,
                        buttons: {
                          ...form.questionnaire.buttons,
                          [key]: v,
                        },
                      },
                    })
                  }
                />
              </Field>
            ))}
          </Section>
        </div>
      ) : null}

      {tab === "funnel" ? (
        <div className="space-y-6">
          <Section title="Challenge page">
            <Field label="Title">
              <Text
                value={form.challenge.title}
                onChange={(v) =>
                  setForm({
                    ...form,
                    challenge: { ...form.challenge, title: v },
                  })
                }
              />
            </Field>
            <Field label="Body">
              <Text
                multiline
                value={form.challenge.body}
                onChange={(v) =>
                  setForm({
                    ...form,
                    challenge: { ...form.challenge, body: v },
                  })
                }
              />
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="CTA label">
                <Text
                  value={form.challenge.cta.label}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      challenge: {
                        ...form.challenge,
                        cta: { ...form.challenge.cta, label: v },
                      },
                    })
                  }
                />
              </Field>
              <Field label="CTA href">
                <Text
                  value={form.challenge.cta.href}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      challenge: {
                        ...form.challenge,
                        cta: { ...form.challenge.cta, href: v },
                      },
                    })
                  }
                />
              </Field>
            </div>
            <Field label="Disqualify eyebrow">
              <Text
                value={form.challenge.disqualifyEyebrow}
                onChange={(v) =>
                  setForm({
                    ...form,
                    challenge: {
                      ...form.challenge,
                      disqualifyEyebrow: v,
                    },
                  })
                }
              />
            </Field>
            {(
              ["commitment", "investment", "both"] as const
            ).map((key) => (
              <Field key={key} label={`Disqualify reason: ${key}`}>
                <Text
                  multiline
                  value={form.challenge.disqualifyReasons[key]}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      challenge: {
                        ...form.challenge,
                        disqualifyReasons: {
                          ...form.challenge.disqualifyReasons,
                          [key]: v,
                        },
                      },
                    })
                  }
                />
              </Field>
            ))}
          </Section>

          <Section title="Calendar page">
            <Field label="Title">
              <Text
                value={form.calendar.title}
                onChange={(v) =>
                  setForm({
                    ...form,
                    calendar: { ...form.calendar, title: v },
                  })
                }
              />
            </Field>
            <Field label="Subhead ({duration}, {tier})">
              <Text
                value={form.calendar.subhead}
                onChange={(v) =>
                  setForm({
                    ...form,
                    calendar: { ...form.calendar, subhead: v },
                  })
                }
              />
            </Field>
            <Field label="Pro event label">
              <Text
                value={form.calendar.proEventLabel}
                onChange={(v) =>
                  setForm({
                    ...form,
                    calendar: { ...form.calendar, proEventLabel: v },
                  })
                }
              />
            </Field>
            <Field label="Elite event label">
              <Text
                value={form.calendar.eliteEventLabel}
                onChange={(v) =>
                  setForm({
                    ...form,
                    calendar: { ...form.calendar, eliteEventLabel: v },
                  })
                }
              />
            </Field>
            <Field label="Booked continue CTA">
              <Text
                value={form.calendar.bookedContinue}
                onChange={(v) =>
                  setForm({
                    ...form,
                    calendar: { ...form.calendar, bookedContinue: v },
                  })
                }
              />
            </Field>
          </Section>

          <Section title="Confirmation page">
            <Field label="Eyebrow">
              <Text
                value={form.confirmation.eyebrow}
                onChange={(v) =>
                  setForm({
                    ...form,
                    confirmation: { ...form.confirmation, eyebrow: v },
                  })
                }
              />
            </Field>
            <Field label="Title">
              <Text
                value={form.confirmation.title}
                onChange={(v) =>
                  setForm({
                    ...form,
                    confirmation: { ...form.confirmation, title: v },
                  })
                }
              />
            </Field>
            <Field label="Body (exact confirmation copy)">
              <Text
                multiline
                value={form.confirmation.body}
                onChange={(v) =>
                  setForm({
                    ...form,
                    confirmation: { ...form.confirmation, body: v },
                  })
                }
              />
            </Field>
            <Field label="WhatsApp checkbox label">
              <Text
                multiline
                value={form.confirmation.whatsappLabel}
                onChange={(v) =>
                  setForm({
                    ...form,
                    confirmation: {
                      ...form.confirmation,
                      whatsappLabel: v,
                    },
                  })
                }
              />
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Save">
                <Text
                  value={form.confirmation.save}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      confirmation: { ...form.confirmation, save: v },
                    })
                  }
                />
              </Field>
              <Field label="Saving">
                <Text
                  value={form.confirmation.saving}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      confirmation: { ...form.confirmation, saving: v },
                    })
                  }
                />
              </Field>
              <Field label="Saved">
                <Text
                  value={form.confirmation.saved}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      confirmation: { ...form.confirmation, saved: v },
                    })
                  }
                />
              </Field>
            </div>
          </Section>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-6 sm:flex-row">
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving || !writable}
          className="w-full rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-fg)] disabled:opacity-50 sm:w-auto sm:py-2.5"
        >
          {saving ? "Saving…" : "Save CMS"}
        </button>
        <button
          type="button"
          onClick={() => void load()}
          className="w-full rounded-md border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--fg)] sm:w-auto sm:py-2.5"
        >
          Refresh
        </button>
        <button
          type="button"
          onClick={() => {
            setForm(DEFAULT_CMS);
            setMessage("Reset to defaults in the form — click Save CMS to persist.");
          }}
          className="w-full rounded-md border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--fg)] sm:w-auto sm:py-2.5"
        >
          Reset form to defaults
        </button>
      </div>
    </div>
  );
}
