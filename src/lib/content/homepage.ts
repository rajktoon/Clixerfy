import type { HomepageData, StrapiHomepageRaw } from "../types";
import { loadSnapshot, getStrapiUrl } from "./utils";

function mapHomepage(raw: StrapiHomepageRaw): HomepageData {
  return {
    hero: {
      badge: raw.hero?.badge ?? "",
      titleText: raw.hero?.titleText ?? "",
      titleHighlight: raw.hero?.titleHighlight ?? "",
      subtitle: raw.hero?.subtitle ?? "",
      ctaLabel: raw.hero?.ctaLabel ?? "",
      ctaHref: raw.hero?.ctaHref ?? "#",
      FeaturedImage: raw.hero?.FeaturedImage ?? null,
      BackgroundImage: raw.hero?.BackgroundImage ?? null,
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

export async function getHomepage(): Promise<HomepageData> {
  try {
    const params = new URLSearchParams();
    params.set("populate[hero][populate]", "*");
    params.set("populate[features][populate]", "*");
    params.set("populate[trust][populate]", "*");
    params.set("populate[products][populate]", "*");
    params.set("populate[threatCards][populate]", "*");
    params.set("populate[testimonials][populate]", "*");
    params.set("populate[cta][populate]", "*");
    const url = `${getStrapiUrl()}/api/homepage?${params.toString()}`;
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`Strapi homepage: ${res.status}`);
    const json = await res.json();
    const raw = json.data?.attributes ?? json.data ?? {};
    return mapHomepage(raw);
  } catch (err) {
    console.warn("[content] homepage not available in Strapi, trying snapshot...");
    try {
      const snapshot = await loadSnapshot("homepage");
      if (snapshot) {
        const raw = snapshot.data?.attributes ?? snapshot.data ?? {};
        return mapHomepage(raw);
      }
    } catch {}
    console.warn("[content] homepage snapshot not available, using defaults.");
    return {
      hero: {
        badge: "",
        titleText: "",
        titleHighlight: "",
        subtitle: "",
        ctaLabel: "",
        ctaHref: "#",
        FeaturedImage: null,
        BackgroundImage: null,
        trustBadges: [],
      },
      features: { sectionTitle: "", items: [] },
      trust: { sectionTitle: "", body: "", stats: [] },
      products: { sectionTitle: "", items: [] },
      threatCards: { sectionTitle: "", sectionSubtitle: "", items: [] },
      cta: { title: "", subtitle: "", ctaLabel: "", ctaHref: "#" },
      testimonials: { sectionTitle: "", sectionSubtitle: "", items: [] },
    };
  }
}
