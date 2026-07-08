import type { SeoPageData, StrapiSeoPageRaw } from "../types";
import { fetchCollection, getStrapiUrl } from "./utils";

function extractFeaturedImage(raw: StrapiSeoPageRaw): string {
  const media = raw.FeaturedImage as any;
  if (!media) return "";
  if (Array.isArray(media) && media.length > 0) {
    const item = media[0];
    const url = item?.attributes?.url ?? item?.url ?? "";
    return url.startsWith("http") ? url : `${getStrapiUrl()}${url}`;
  }
  if (typeof media === "object" && media.url) {
    const url = media.url;
    return url.startsWith("http") ? url : `${getStrapiUrl()}${url}`;
  }
  return "";
}

function mapSeoPage(raw: StrapiSeoPageRaw & { id: number }): SeoPageData {
  return {
    id: raw.id,
    title: raw.Title,
    slug: raw.Slug,
    metaTitle: raw.MetaTitle,
    metaDescription: raw.MetaDescription,
    heroTitle: raw.HeroTitle,
    heroDescription: raw.HeroDescription ?? [],
    content: raw.Content ?? [],
    featuredImageUrl: extractFeaturedImage(raw),
    faq: raw.Faq ?? [],
    services: raw.Services ?? [],
    testimonials: raw.Testimonials ?? [],
    stats: raw.Stats ?? [],
  };
}

export async function getSeoPage(slug: string): Promise<SeoPageData> {
  const entries = await fetchCollection(
    "seo-pages",
    `&filters[Slug][$eq]=${slug}`,
  );
  if (!entries.length) {
    throw new Error(`[content] No SEO page found for slug "${slug}"`);
  }
  const raw = entries[0].attributes ?? entries[0];
  return mapSeoPage({ ...raw, id: entries[0].id });
}

export async function getSeoPageSlugs(): Promise<string[]> {
  const entries = await fetchCollection("seo-pages", "&fields[0]=Slug");
  return entries.map((e: any) => e.attributes?.Slug ?? e.Slug).filter(Boolean);
}
