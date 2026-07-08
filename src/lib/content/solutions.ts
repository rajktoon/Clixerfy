import { richTextToHtml } from "../strapi";
import type { SolutionPageData, SolutionSection } from "../types";
import {
  loadSnapshot,
  shouldUseSnapshots,
  getStrapiUrl,
  fetchCollection,
} from "./utils";

function resolveMediaUrl(media: any): string {
  if (!media) return "";
  const url = media?.url ?? media?.attributes?.url ?? "";
  if (!url) return "";
  return url.startsWith("http") ? url : `${getStrapiUrl()}${url}`;
}

function mapDynamicZoneSection(section: any): SolutionSection | null {
  const comp = section.__component;
  switch (comp) {
    case "sections.hero":
      return {
        __component: "sections.hero",
        badge: section.badge ?? "",
        title: section.title ?? "",
        subtitle: richTextToHtml(section.subtitle),
        ctaLabel: section.ctaLabel ?? "",
        ctaHref: section.ctaHref ?? "#",
        imageUrl: resolveMediaUrl(section.image),
      };
    case "sections.content":
      return {
        __component: "sections.content",
        title: section.title ?? "",
        body: richTextToHtml(section.body),
        imageUrl: resolveMediaUrl(section.image),
      };
    case "sections.feature-grid":
      return {
        __component: "sections.feature-grid",
        sectionTitle: section.sectionTitle ?? "",
        sectionSubtitle: section.sectionSubtitle ?? "",
        items: (section.items ?? []).map((item: any) => ({
          title: item.title ?? "",
          description: richTextToHtml(item.description),
          iconUrl: resolveMediaUrl(item.icon),
          imageUrl: resolveMediaUrl(item.image),
        })),
      };
    case "sections.process":
      return {
        __component: "sections.process",
        title: section.title ?? "",
        steps: (section.steps ?? []).map((step: any) => ({
          title: step.title ?? "",
          description: richTextToHtml(step.description),
          imageUrl: resolveMediaUrl(step.image),
        })),
      };
    case "sections.protection-levels":
      return {
        __component: "sections.protection-levels",
        title: section.title ?? "",
        items: (section.items ?? []).map((item: any) => ({
          title: item.title ?? "",
          description: item.description ?? "",
          iconUrl: resolveMediaUrl(item.icon),
        })),
      };
    case "sections.benefits":
      return {
        __component: "sections.benefits",
        title: section.title ?? "",
        items: (section.items ?? []).map((item: any) => ({
          title: item.title ?? "",
          description: item.description ?? "",
          iconUrl: resolveMediaUrl(item.icon),
        })),
      };
    case "sections.stats":
      return {
        __component: "sections.stats",
        items: (section.items ?? []).map((item: any) => ({
          value: item.value ?? "",
          label: item.label ?? "",
          iconUrl: resolveMediaUrl(item.icon),
        })),
      };
    case "sections.faq":
      return {
        __component: "sections.faq",
        title: section.title ?? "",
        items: (section.items ?? []).map((item: any) => ({
          question: item.question ?? "",
          answer: richTextToHtml(item.answer),
        })),
      };
    case "sections.cta":
      return {
        __component: "sections.cta",
        title: section.title ?? "",
        subtitle: section.subtitle ?? "",
        buttonLabel: section.buttonLabel ?? "",
        buttonHref: section.buttonHref ?? "#",
        imageUrl: resolveMediaUrl(section.image),
      };
    default:
      console.warn(`[content] Unknown solution section: ${comp}`);
      return null;
  }
}

function mapSolutionPage(id: number, raw: any, slug: string): SolutionPageData {
  return {
    id,
    title: raw.title ?? "",
    slug: raw.slug ?? slug,
    metaTitle: raw.metaTitle ?? "",
    metaDescription: raw.metaDescription ?? "",
    herosection: raw.herosection ?? [],
    features: raw.features ?? [],
    Richtext: raw.Richtext ?? [],
    process: raw.process ?? [],
    protections: raw.protections ?? [],
    benefits: raw.benefits ?? [],
    stats: raw.stats ?? [],
    faqs: raw.faqs ?? [],
    cta: raw.cta ?? [],
    PricingTable: raw.PricingTable ?? null,
  };
}

export async function getSolutionPage(slug: string): Promise<SolutionPageData> {
  if (shouldUseSnapshots()) {
    const snapshot = await loadSnapshot("solutions");
    if (!snapshot) throw new Error(`No snapshot for solutions`);
    const entries = Array.isArray(snapshot.data) ? snapshot.data : [];
    const match = entries.find(
      (e: any) => (e.attributes?.slug ?? e.slug) === slug,
    );
    if (!match)
      throw new Error(
        `[content] No solution found for slug "${slug}" in snapshot`,
      );
    const raw = match.attributes ?? match;
    return mapSolutionPage(match.id, raw, slug);
  }

  try {
    const params = new URLSearchParams();
    params.set("populate[herosection][populate]", "*");
    params.set("populate[features][populate]", "*");
    params.set("populate[Richtext][populate]", "*");
    params.set("populate[process][populate]", "*");
    params.set("populate[protections][populate]", "*");
    params.set("populate[benefits][populate]", "*");
    params.set("populate[stats][populate]", "*");
    params.set("populate[faqs][populate]", "*");
    params.set("populate[cta][populate]", "*");
    params.set("populate[PricingTable][populate][plans][populate]", "*");
    const url = `${getStrapiUrl()}/api/solutions?filters[slug][$eq]=${slug}&${params.toString()}`;
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`Strapi fetch failed: ${url} (${res.status})`);
    const json = await res.json();
    const entries = Array.isArray(json.data)
      ? json.data
      : json.data
        ? [json.data]
        : [];
    if (!entries.length)
      throw new Error(`[content] No solution found for slug "${slug}"`);
    const raw = entries[0].attributes ?? entries[0];
    return mapSolutionPage(entries[0].id, raw, slug);
  } catch (err) {
    console.warn(
      `[content] Strapi unavailable for solutions, trying snapshot...`,
    );
    const snapshot = await loadSnapshot("solutions");
    if (!snapshot) throw new Error(`No snapshot for solutions`);
    const entries = Array.isArray(snapshot.data) ? snapshot.data : [];
    const match = entries.find(
      (e: any) => (e.attributes?.slug ?? e.slug) === slug,
    );
    if (!match)
      throw new Error(
        `[content] No solution found for slug "${slug}" in snapshot`,
      );
    const raw = match.attributes ?? match;
    return mapSolutionPage(match.id, raw, slug);
  }
}

export async function getSolutionSlugs(): Promise<string[]> {
  const entries = await fetchCollection("solutions", "&fields[0]=slug");
  return entries.map((e: any) => e.attributes?.slug ?? e.slug).filter(Boolean);
}
