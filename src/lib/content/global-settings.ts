import { fetchSingle } from "./utils";

export async function getGlobalSettings(): Promise<{
  siteName: string;
  themeColor: string;
  brandColor: string;
  accentColor: string;
}> {
  try {
    const raw = await fetchSingle<{
      siteName: string;
      themeColor: string;
      brandColor: string;
      accentColor: string;
    }>("global-settings");
    return {
      siteName: raw.siteName ?? "Clixerfy",
      themeColor: raw.themeColor ?? "#0a0a0a",
      brandColor: raw.brandColor ?? "#e63030",
      accentColor: raw.accentColor ?? "#0a0a0a",
    };
  } catch {
    return {
      siteName: "Clixerfy",
      themeColor: "#0a0a0a",
      brandColor: "#e63030",
      accentColor: "#0a0a0a",
    };
  }
}
