/// <reference types="astro/client" />
import fs from "fs/promises";

export async function loadSnapshot(name: string) {
  try {
    const file = await fs.readFile(`./content-snapshot/${name}.json`, "utf8");
    return JSON.parse(file);
  } catch {
    return null;
  }
}

/** Check if we should skip Strapi and use snapshots only (CI/deployment) */
export function shouldUseSnapshots(): boolean {
  return !!(
    process.env.CI ||
    process.env.VERCEL ||
    process.env.NETLIFY ||
    process.env.USE_SNAPSHOTS
  );
}

export function getStrapiUrl(): string {
  return import.meta.env.STRAPI_URL ?? "http://localhost:1337";
}

/** Fetch a Strapi Single Type (returns data.attributes) with snapshot fallback */
export async function fetchSingle<T>(
  endpoint: string,
  deepPopulate = false,
): Promise<T> {
  if (shouldUseSnapshots()) {
    const snapshot = await loadSnapshot(endpoint);
    if (!snapshot) throw new Error(`No snapshot for ${endpoint}`);
    return snapshot.data?.attributes ?? snapshot.data;
  }

  let url = `${getStrapiUrl()}/api/${endpoint}?populate=*`;
  if (deepPopulate) {
    const params = new URLSearchParams();
    params.set("populate[Mission][populate]", "*");
    params.set("populate[Values][populate]", "*");
    params.set("populate[Story][populate]", "*");
    params.set("populate[CTA][populate]", "*");
    params.set("populate[Hero][populate]", "*");
    url = `${getStrapiUrl()}/api/${endpoint}?${params.toString()}`;
  }

  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`Strapi fetch failed: ${url} (${res.status})`);
    const json = await res.json();
    return json.data?.attributes ?? json.data;
  } catch (err) {
    console.warn(
      `[content] Strapi unavailable for ${endpoint}, trying snapshot...`,
    );
    const snapshot = await loadSnapshot(endpoint);
    if (!snapshot) throw new Error(`No snapshot for ${endpoint}`);
    return snapshot.data?.attributes ?? snapshot.data;
  }
}

/** Fetch a Strapi Collection Type (returns array of entries) with snapshot fallback */
export async function fetchCollection(
  endpoint: string,
  query = "",
): Promise<any[]> {
  if (shouldUseSnapshots()) {
    const snapshot = await loadSnapshot(endpoint);
    if (!snapshot) return [];
    return Array.isArray(snapshot.data) ? snapshot.data : [];
  }

  const url = `${getStrapiUrl()}/api/${endpoint}?populate=*${query}`;
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`Strapi fetch failed: ${url} (${res.status})`);
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (err) {
    console.warn(
      `[content] Strapi unavailable for ${endpoint}, trying snapshot...`,
    );
    const snapshot = await loadSnapshot(endpoint);
    if (!snapshot) return [];
    return Array.isArray(snapshot.data) ? snapshot.data : [];
  }
}
