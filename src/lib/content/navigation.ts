import type { NavigationData, StrapiNavigationRaw } from "../types";
import { loadSnapshot, shouldUseSnapshots, getStrapiUrl } from "./utils";

function mapNavigation(raw: StrapiNavigationRaw): NavigationData {
  return {
    logoText: raw.logoText ?? "Clixerfy",
    logoImageUrl: raw.logoImageUrl ?? "",
    links: raw.links ?? [],
    ctaLabel: raw.ctaLabel ?? "Contact",
    ctaHref: raw.ctaHref ?? "/contact",
  };
}

export async function getNavigation(): Promise<NavigationData> {
  if (shouldUseSnapshots()) {
    const snapshot = await loadSnapshot("navigation");
    if (snapshot) {
      const raw: StrapiNavigationRaw =
        snapshot.data?.attributes ?? snapshot.data;
      return mapNavigation(raw);
    }
    console.warn("[content] navigation snapshot not found, using defaults.");
    return {
      logoText: "Clixerfy",
      logoImageUrl: "",
      links: [],
      ctaLabel: "Contact",
      ctaHref: "/contact",
    };
  }

  try {
    const params = new URLSearchParams();
    params.set("populate[links][populate]", "*");
    const url = `${getStrapiUrl()}/api/navigation?${params.toString()}`;
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`Strapi fetch failed: ${url} (${res.status})`);
    const json = await res.json();
    const raw: StrapiNavigationRaw = json.data?.attributes ?? json.data;
    return mapNavigation(raw);
  } catch (err) {
    console.warn(
      "[content] Strapi unavailable for navigation, trying snapshot...",
    );
    const snapshot = await loadSnapshot("navigation");
    if (snapshot) {
      const raw: StrapiNavigationRaw =
        snapshot.data?.attributes ?? snapshot.data;
      return mapNavigation(raw);
    }
    console.warn("[content] navigation snapshot not found, using defaults.");
    return {
      logoText: "Clixerfy",
      logoImageUrl: "",
      links: [],
      ctaLabel: "Contact",
      ctaHref: "/contact",
    };
  }
}
