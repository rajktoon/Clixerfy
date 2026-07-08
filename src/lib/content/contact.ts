import type { ContactPageData } from "../types";
import { loadSnapshot, shouldUseSnapshots, getStrapiUrl } from "./utils";

function mapContactPage(raw: any): ContactPageData {
  return {
    id: raw.id ?? 0,
    hero: raw.hero ?? [],
    Contact: raw.Contact ?? null,
    form: raw.form ?? null,
  };
}

export async function getContactPage(): Promise<ContactPageData> {
  if (shouldUseSnapshots()) {
    const snapshot = await loadSnapshot("contact");
    if (!snapshot) throw new Error(`No snapshot for contact`);
    const raw = snapshot.data?.attributes ?? snapshot.data ?? {};
    return mapContactPage(raw);
  }

  try {
    const params = new URLSearchParams();
    params.set("populate[hero][populate]", "*");
    params.set("populate[Contact][populate][items][populate]", "*");
    params.set("populate[form][populate]", "*");
    const url = `${getStrapiUrl()}/api/contact?${params.toString()}`;
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`Strapi contact: ${res.status}`);
    const json = await res.json();
    const raw = json.data?.attributes ?? json.data ?? {};
    return mapContactPage(raw);
  } catch (err) {
    console.warn("[content] Strapi unavailable for contact, trying snapshot...");
    const snapshot = await loadSnapshot("contact");
    if (!snapshot) throw new Error(`No snapshot for contact`);
    const raw = snapshot.data?.attributes ?? snapshot.data ?? {};
    return mapContactPage(raw);
  }
}
