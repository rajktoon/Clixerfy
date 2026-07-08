import type { SeoDefaultsData, StrapiSeoDefaultsRaw } from "../types";
import { fetchSingle } from "./utils";

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

export async function getSeoDefaults(): Promise<SeoDefaultsData> {
  try {
    const raw = await fetchSingle<StrapiSeoDefaultsRaw>("seo-default");
    return mapSeoDefaults(raw);
  } catch (err) {
    console.warn(
      "[content] seo-defaults not available in Strapi, using defaults.",
    );
    return {
      title: "Clixerfy",
      description: "",
      canonical: "",
      ogImage: "",
      structuredData: {
        name: "Clixerfy",
        applicationCategory: "Security",
        price: "0",
        priceCurrency: "CAD",
        offerDescription: "",
        ratingValue: "5",
        reviewCount: "0",
      },
    };
  }
}
