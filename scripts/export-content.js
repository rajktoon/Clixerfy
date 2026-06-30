import fs from "fs/promises";

const STRAPI = process.env.STRAPI_URL || "http://localhost:1337";

async function save(endpoint, file, queryParams = "") {
  const url = `${STRAPI}/api/${endpoint}${queryParams ? `?${queryParams}` : ""}`;
  console.log("→", endpoint);

  const res = await fetch(url);
  if (!res.ok) {
    console.error("✗", file, `— HTTP ${res.status}`);
    return;
  }
  const json = await res.json();

  await fs.mkdir("./content-snapshot", { recursive: true });

  await fs.writeFile(
    `./content-snapshot/${file}.json`,
    JSON.stringify(json, null, 2)
  );

  console.log("✓", file);
}

// ── Single Types (with deep populate matching content.ts) ──

// navigation: populate[links][populate]=*
await save("navigation", "navigation", "populate[links][populate]=*");

// footer: populate[linkGroups][populate]=* & populate[socials][populate]=*
await save("footer", "footer", "populate[linkGroups][populate]=*&populate[socials][populate]=*");

// seo-default: simple populate=*
await save("seo-default", "seo-default", "populate=*");

// homepage: simple populate=*
await save("homepage", "homepage", "populate=*");

// about-page: deep populate for Mission, Values, Story, CTA, Hero
const aboutParams = [
  "populate[Mission][populate]=*",
  "populate[Values][populate]=*",
  "populate[Story][populate]=*",
  "populate[CTA][populate]=*",
  "populate[Hero][populate]=*",
].join("&");
await save("about-page", "about-page", aboutParams);

// global-settings: simple populate=*
await save("global-settings", "global-settings", "populate=*");

// ── Collection Types ──

// seo-pages: populate=*
await save("seo-pages", "seo-pages", "populate=*");

// solutions: populate[sections][populate]=* (for Dynamic Zone)
await save("solutions", "solutions", "populate[sections][populate]=*");

console.log("\n✓ All content exported to ./content-snapshot/");
