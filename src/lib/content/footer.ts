import type { FooterData, StrapiFooterRaw } from "../types";
import { loadSnapshot, shouldUseSnapshots, getStrapiUrl } from "./utils";

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

export async function getFooter(): Promise<FooterData> {
  if (shouldUseSnapshots()) {
    const snapshot = await loadSnapshot("footer");
    if (snapshot) {
      const raw: StrapiFooterRaw = snapshot.data?.attributes ?? snapshot.data;
      return mapFooter(raw);
    }
    console.warn("[content] footer snapshot not found, using defaults.");
    return {
      tagline: "",
      socials: [],
      linkGroups: [],
      newsletter: {
        title: "",
        description: "",
        placeholder: "",
        buttonLabel: "Subscribe",
      },
      copyright: "",
    };
  }

  try {
    const params = new URLSearchParams();
    params.set("populate[linkGroups][populate]", "*");
    params.set("populate[socials][populate]", "*");
    const url = `${getStrapiUrl()}/api/footer?${params.toString()}`;
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
    });
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
    return {
      tagline: "",
      socials: [],
      linkGroups: [],
      newsletter: {
        title: "",
        description: "",
        placeholder: "",
        buttonLabel: "Subscribe",
      },
      copyright: "",
    };
  }
}
