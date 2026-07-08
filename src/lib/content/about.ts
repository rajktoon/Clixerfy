import { richTextToHtml } from "../strapi";
import type { AboutPageData, StrapiAboutPageRaw } from "../types";
import { fetchSingle } from "./utils";

function mapAboutPage(raw: StrapiAboutPageRaw): AboutPageData {
  const valuesEntry = Array.isArray(raw.Values) ? raw.Values[0] : raw.Values;
  return {
    hero: {
      badge: raw.Hero?.badge ?? "",
      titleText: raw.Hero?.titleText ?? "",
      titleHighlight: raw.Hero?.titleHighlight ?? "",
      subtitle: raw.Hero?.subtitle ?? "",
      illustrationUrl: raw.Hero?.illustrationUrl ?? "/About Us.svg",
      featuredimage: raw.Hero?.featuredimage ?? null,
      CTAButtonText: raw.Hero?.CTAButtonText ?? null,
      CTAButtonLink: raw.Hero?.CTAButtonLink ?? null,
    },
    mission: {
      sectionTitle: raw.Mission?.sectionTitle ?? "",
      body: richTextToHtml(raw.Mission?.body),
      stats: (raw.Mission?.stats ?? []).map((s) => ({
        value: s.value,
        label: s.label,
      })),
    },
    values: {
      sectionTitle: valuesEntry?.sectionTitle ?? "",
      sectionSubtitle: valuesEntry?.sectionSubtitle ?? "",
      items: (valuesEntry?.items ?? []).map((i) => ({
        title: i.title,
        desc: i.description ?? i.desc ?? "",
        iconUrl: i.iconUrl ?? "",
        icon: i.icon ?? null,
      })),
    },
    story: {
      sectionTitle: raw.Story?.sectionTitle ?? "",
      body: richTextToHtml(raw.Story?.body),
      highlights: (raw.Story?.timeline ?? raw.Story?.highlights ?? []).map(
        (h) => ({
          year: h.year,
          title: h.title,
          desc: h.desc ?? h.description ?? "",
        }),
      ),
    },
    cta: {
      title: raw.CTA?.title ?? "",
      subtitle: raw.CTA?.subtitle ?? "",
      ctaLabel: raw.CTA?.ctaLabel ?? "",
      ctaHref: raw.CTA?.ctaHref ?? "#",
    },
  };
}

export async function getAboutPage(): Promise<AboutPageData> {
  try {
    const raw = await fetchSingle<StrapiAboutPageRaw>("about-page", true);
    return mapAboutPage(raw);
  } catch (err) {
    console.warn(
      "[content] about-page not available in Strapi, using defaults.",
    );
    return {
      hero: {
        badge: "",
        titleText: "",
        titleHighlight: "",
        subtitle: "",
        illustrationUrl: "/About Us.svg",
        featuredimage: null,
        CTAButtonText: null,
        CTAButtonLink: null,
      },
      mission: { sectionTitle: "", body: "", stats: [] },
      values: { sectionTitle: "", sectionSubtitle: "", items: [] },
      story: { sectionTitle: "", body: "", highlights: [] },
      cta: { title: "", subtitle: "", ctaLabel: "", ctaHref: "#" },
    };
  }
}
