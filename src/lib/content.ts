import fs from "fs/promises";

import { richTextToHtml } from "./strapi";
import type {
  NavigationData,
  FooterData,
  SeoDefaultsData,
  HomepageData,
  SeoPageData,
  AboutPageData,
  SolutionPageData,
  SolutionSection,
  StrapiSeoPageRaw,
  StrapiNavigationRaw,
  StrapiFooterRaw,
  StrapiSeoDefaultsRaw,
  StrapiHomepageRaw,
  StrapiAboutPageRaw,
} from "./types";


async function loadSnapshot(name: string) {
  try {
    const file = await fs.readFile(
      `./content-snapshot/${name}.json`,
      "utf8"
    );

    return JSON.parse(file);
  } catch {
    return null;
  }
}



// ── Helpers ──

function getStrapiUrl(): string {
  return import.meta.env.STRAPI_URL ?? "http://localhost:1337";
}

/** Fetch a Strapi Single Type (returns data.attributes) with snapshot fallback */
async function fetchSingle<T>(endpoint: string, deepPopulate = false): Promise<T> {
  let url = `${getStrapiUrl()}/api/${endpoint}?populate=*`;
  if (deepPopulate) {
    // Deep populate for nested components
    const params = new URLSearchParams();
    params.set('populate[Mission][populate]', '*');
    params.set('populate[Values][populate]', '*');
    params.set('populate[Story][populate]', '*');
    params.set('populate[CTA][populate]', '*');
    params.set('populate[Hero][populate]', '*');
    url = `${getStrapiUrl()}/api/${endpoint}?${params.toString()}`;
  }
  try {
    const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
    if (!res.ok) throw new Error(`Strapi fetch failed: ${url} (${res.status})`);
    const json = await res.json();
    return json.data?.attributes ?? json.data;
  } catch (err) {
    console.warn(`[content] Strapi unavailable for ${endpoint}, trying snapshot...`);
    const snapshot = await loadSnapshot(endpoint);
    if (!snapshot) throw new Error(`No snapshot for ${endpoint}`);
    return snapshot.data?.attributes ?? snapshot.data;
  }
}

/** Fetch a Strapi Collection Type (returns array of entries) with snapshot fallback */
async function fetchCollection(endpoint: string, query = ""): Promise<any[]> {
  const url = `${getStrapiUrl()}/api/${endpoint}?populate=*${query}`;
  try {
    const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
    if (!res.ok) throw new Error(`Strapi fetch failed: ${url} (${res.status})`);
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (err) {
    console.warn(`[content] Strapi unavailable for ${endpoint}, trying snapshot...`);
    const snapshot = await loadSnapshot(endpoint);
    if (!snapshot) return [];
    return Array.isArray(snapshot.data) ? snapshot.data : [];
  }
}

// ── Mapping: Strapi raw → normalized app types ──

function mapNavigation(raw: StrapiNavigationRaw): NavigationData {
  return {
    logoText: raw.logoText ?? "Clixerfy",
    logoImageUrl: raw.logoImageUrl ?? "",
    links: raw.links ?? [],
    ctaLabel: raw.ctaLabel ?? "Contact",
    ctaHref: raw.ctaHref ?? "#contact",
  };
}

function mapFooter(raw: StrapiFooterRaw): FooterData {
  return {
    tagline: raw.tagline ?? "",
    socials: raw.socials ?? [],
    linkGroups: raw.linkGroups ?? [],
    newsletter: {
      title: raw.newsletterTitle ?? "",
      description: raw.newsletterDescription ?? "",
      placeholder: raw.newsletterPlaceholder ?? "",
      buttonLabel: raw.newsletterButtonLabel ?? "Subscribe",
    },
    copyright: raw.copyright ?? "",
  };
}

function mapSeoDefaults(raw: StrapiSeoDefaultsRaw): SeoDefaultsData {
  return {
    title: raw.title ?? "Clixerfy",
    description: raw.description ?? "",
    canonical: raw.canonical ?? "",
    ogImage: raw.ogImage ?? "",
    structuredData: {
      name: raw.structuredDataName ?? "Clixerfy",
      applicationCategory: raw.structuredDataCategory ?? "Security",
      price: raw.structuredDataPrice ?? "0",
      priceCurrency: raw.structuredDataPriceCurrency ?? "CAD",
      offerDescription: raw.structuredDataOfferDesc ?? "",
      ratingValue: raw.structuredDataRatingValue ?? "5",
      reviewCount: raw.structuredDataReviewCount ?? "0",
    },
  };
}

function mapHomepage(raw: StrapiHomepageRaw): HomepageData {
  return {
    hero: {
      badge: raw.hero?.badge ?? "",
      titleText: raw.hero?.titleText ?? "",
      titleHighlight: raw.hero?.titleHighlight ?? "",
      subtitle: raw.hero?.subtitle ?? "",
      ctaLabel: raw.hero?.ctaLabel ?? "",
      ctaHref: raw.hero?.ctaHref ?? "#",
      trustBadges: raw.hero?.trustBadges ?? [],
    },
    features: {
      sectionTitle: raw.features?.sectionTitle ?? "",
      items: raw.features?.items ?? [],
    },
    trust: {
      sectionTitle: raw.trust?.sectionTitle ?? "",
      body: raw.trust?.body ?? "",
      stats: raw.trust?.stats ?? [],
    },
    products: {
      sectionTitle: raw.products?.sectionTitle ?? "",
      items: raw.products?.items ?? [],
    },
    threatCards: {
      sectionTitle: raw.threatCards?.sectionTitle ?? "",
      sectionSubtitle: raw.threatCards?.sectionSubtitle ?? "",
      items: raw.threatCards?.items ?? [],
    },
    cta: {
      title: raw.cta?.title ?? "",
      subtitle: raw.cta?.subtitle ?? "",
      ctaLabel: raw.cta?.ctaLabel ?? "",
      ctaHref: raw.cta?.ctaHref ?? "#",
    },
    testimonials: {
      sectionTitle: raw.testimonials?.sectionTitle ?? "",
      sectionSubtitle: raw.testimonials?.sectionSubtitle ?? "",
      items: raw.testimonials?.items ?? [],
    },
  };
}

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

// ── Public content loaders (Strapi-only, with safe defaults) ──

export async function getNavigation(): Promise<NavigationData> {
  try {
    const params = new URLSearchParams();
    params.set('populate[links][populate]', '*');
    const url = `${getStrapiUrl()}/api/navigation?${params.toString()}`;
    const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
    if (!res.ok) throw new Error(`Strapi fetch failed: ${url} (${res.status})`);
    const json = await res.json();
    const raw: StrapiNavigationRaw = json.data?.attributes ?? json.data;
    return mapNavigation(raw);
  } catch (err) {
    console.warn("[content] Strapi unavailable for navigation, trying snapshot...");
    const snapshot = await loadSnapshot("navigation");
    if (snapshot) {
      const raw: StrapiNavigationRaw = snapshot.data?.attributes ?? snapshot.data;
      return mapNavigation(raw);
    }
    console.warn("[content] navigation snapshot not found, using defaults.");
    return { logoText: "Clixerfy", logoImageUrl: "", links: [], ctaLabel: "Contact", ctaHref: "#contact" };
  }
}

export async function getFooter(): Promise<FooterData> {
  try {
    const params = new URLSearchParams();
    params.set('populate[linkGroups][populate]', '*');
    params.set('populate[socials][populate]', '*');
    const url = `${getStrapiUrl()}/api/footer?${params.toString()}`;
    const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
    if (!res.ok) throw new Error(`Strapi fetch failed: ${url} (${res.status})`);
    const json = await res.json();
    const raw: StrapiFooterRaw = json.data?.attributes ?? json.data;
    return mapFooter(raw);
  } catch (err) {
    console.warn("[content] Strapi unavailable for footer, trying snapshot...");
    const snapshot = await loadSnapshot("footer");
    if (snapshot) {
      const raw: StrapiFooterRaw = snapshot.data?.attributes ?? snapshot.data;
      return mapFooter(raw);
    }
    console.warn("[content] footer snapshot not found, using defaults.");
    return { tagline: "", socials: [], linkGroups: [], newsletter: { title: "", description: "", placeholder: "", buttonLabel: "Subscribe" }, copyright: "" };
  }
}

export async function getSeoDefaults(): Promise<SeoDefaultsData> {
  try {
    const raw = await fetchSingle<StrapiSeoDefaultsRaw>("seo-default");
    return mapSeoDefaults(raw);
  } catch (err) {
    console.warn("[content] seo-defaults not available in Strapi, using defaults.");
    return {
      title: "Clixerfy", description: "", canonical: "", ogImage: "",
      structuredData: { name: "Clixerfy", applicationCategory: "Security", price: "0", priceCurrency: "CAD", offerDescription: "", ratingValue: "5", reviewCount: "0" },
    };
  }
}

export async function getHomepage(): Promise<HomepageData> {
  try {
    const raw = await fetchSingle<StrapiHomepageRaw>("homepage");
    return mapHomepage(raw);
  } catch (err) {
    console.warn("[content] homepage not available in Strapi, using defaults.");
    return {
      hero: { badge: "", titleText: "", titleHighlight: "", subtitle: "", ctaLabel: "", ctaHref: "#", trustBadges: [] },
      features: { sectionTitle: "", items: [] },
      trust: { sectionTitle: "", body: "", stats: [] },
      products: { sectionTitle: "", items: [] },
      threatCards: { sectionTitle: "", sectionSubtitle: "", items: [] },
      cta: { title: "", subtitle: "", ctaLabel: "", ctaHref: "#" },
      testimonials: { sectionTitle: "", sectionSubtitle: "", items: [] },
    };
  }
}

// ── About Page loader ──

function mapAboutPage(raw: StrapiAboutPageRaw): AboutPageData {
  // Values is an array in Strapi; take first entry
  const valuesEntry = Array.isArray(raw.Values) ? raw.Values[0] : raw.Values;
  return {
    hero: {
      badge: raw.Hero?.badge ?? "",
      titleText: raw.Hero?.titleText ?? "",
      titleHighlight: raw.Hero?.titleHighlight ?? "",
      subtitle: raw.Hero?.subtitle ?? "",
      illustrationUrl: raw.Hero?.illustrationUrl ?? "/About Us.svg",
    },
    mission: {
      sectionTitle: raw.Mission?.sectionTitle ?? "",
      body: richTextToHtml(raw.Mission?.body),
      stats: (raw.Mission?.stats ?? []).map(s => ({ value: s.value, label: s.label })),
    },
    values: {
      sectionTitle: valuesEntry?.sectionTitle ?? "",
      sectionSubtitle: valuesEntry?.sectionSubtitle ?? "",
      items: (valuesEntry?.items ?? []).map(i => ({ title: i.title, desc: i.description ?? i.desc ?? "", iconUrl: i.iconUrl ?? "" })),
    },
    story: {
      sectionTitle: raw.Story?.sectionTitle ?? "",
      body: richTextToHtml(raw.Story?.body),
      highlights: (raw.Story?.timeline ?? raw.Story?.highlights ?? []).map(h => ({ year: h.year, title: h.title, desc: h.desc ?? h.description ?? "" })),
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
    const raw = await fetchSingle<StrapiAboutPageRaw>("about-page", true); // deep populate
    return mapAboutPage(raw);
  } catch (err) {
    console.warn("[content] about-page not available in Strapi, using defaults.");
    return {
      hero: { badge: "", titleText: "", titleHighlight: "", subtitle: "", illustrationUrl: "/About Us.svg" },
      mission: { sectionTitle: "", body: "", stats: [] },
      values: { sectionTitle: "", sectionSubtitle: "", items: [] },
      story: { sectionTitle: "", body: "", highlights: [] },
      cta: { title: "", subtitle: "", ctaLabel: "", ctaHref: "#" },
    };
  }
}


/** Fetch global settings (themeColor, siteName, brandColor, accentColor) from Strapi */
export async function getGlobalSettings(): Promise<{ siteName: string; themeColor: string; brandColor: string; accentColor: string }> {
  try {
    const raw = await fetchSingle<{ siteName: string; themeColor: string; brandColor: string; accentColor: string }>("global-settings");
    return {
      siteName: raw.siteName ?? "Clixerfy",
      themeColor: raw.themeColor ?? "#0a0a0a",
      brandColor: raw.brandColor ?? "#e63030",
      accentColor: raw.accentColor ?? "#0a0a0a",
    };
  } catch {
    return { siteName: "Clixerfy", themeColor: "#0a0a0a", brandColor: "#e63030", accentColor: "#0a0a0a" };
  }
}

// ── SEO Page loaders ──

export async function getSeoPage(slug: string): Promise<SeoPageData> {
  const entries = await fetchCollection("seo-pages", `&filters[Slug][$eq]=${slug}`);
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

// ── Solution Page loaders ──

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

export async function getSolutionPage(slug: string): Promise<SolutionPageData> {
  try {
    const url = `${getStrapiUrl()}/api/solutions?filters[slug][$eq]=${slug}&populate[sections][populate]=*`;
    const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
    if (!res.ok) throw new Error(`Strapi fetch failed: ${url} (${res.status})`);
    const json = await res.json();
    const entries = Array.isArray(json.data) ? json.data : json.data ? [json.data] : [];
    if (!entries.length) throw new Error(`[content] No solution found for slug "${slug}"`);
    const raw = entries[0].attributes ?? entries[0];
    const sections = (raw.sections ?? [])
      .map(mapDynamicZoneSection)
      .filter(Boolean) as SolutionSection[];
    return {
      id: entries[0].id,
      title: raw.title ?? "",
      slug: raw.slug ?? slug,
      metaTitle: raw.metaTitle ?? "",
      metaDescription: raw.metaDescription ?? "",
      sections,
    };
  } catch (err) {
    console.warn(`[content] Strapi unavailable for solutions, trying snapshot...`);
    const snapshot = await loadSnapshot("solutions");
    if (!snapshot) throw new Error(`No snapshot for solutions`);
    const entries = Array.isArray(snapshot.data) ? snapshot.data : [];
    const match = entries.find((e: any) => (e.attributes?.slug ?? e.slug) === slug);
    if (!match) throw new Error(`[content] No solution found for slug "${slug}" in snapshot`);
    const raw = match.attributes ?? match;
    const sections = (raw.sections ?? [])
      .map(mapDynamicZoneSection)
      .filter(Boolean) as SolutionSection[];
    return {
      id: match.id,
      title: raw.title ?? "",
      slug: raw.slug ?? slug,
      metaTitle: raw.metaTitle ?? "",
      metaDescription: raw.metaDescription ?? "",
      sections,
    };
  }
}

export async function getSolutionSlugs(): Promise<string[]> {
  const entries = await fetchCollection("solutions", "&fields[0]=slug");
  return entries.map((e: any) => e.attributes?.slug ?? e.slug).filter(Boolean);
}

