// ── Strapi Response Wrappers ──

/** Generic Strapi single attribute wrapper */
interface StrapiAttr<T> {
  id: number;
  attributes: T;
}

/** Generic Strapi media object */
export interface StrapiMediaItem {
  id: number;
  url: string;
  alternativeText: string | null;
  name: string;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
    large?: { url: string };
  };
}

// ── Strapi Raw Response Types (capitalized field names) ──

export interface StrapiNavigationRaw {
  logoText: string;
  logoImageUrl: string;
  links: Array<{
    label: string;
    href: string;
    active: boolean;
    submenu?: Array<{ label: string; href: string }>;
  }>;
  ctaLabel: string;
  ctaHref: string;
}

export interface StrapiFooterRaw {
  tagline: string;
  socials: Array<{ label: string; href: string }>;
  linkGroups: Array<{
    title: string;
    links: Array<{ label: string; href: string }>;
  }>;
  newsletterTitle: string;
  newsletterDescription: string;
  newsletterPlaceholder: string;
  newsletterButtonLabel: string;
  copyright: string;
}

export interface StrapiSeoDefaultsRaw {
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
  structuredDataName: string;
  structuredDataCategory: string;
  structuredDataPrice: string;
  structuredDataPriceCurrency: string;
  structuredDataOfferDesc: string;
  structuredDataRatingValue: string;
  structuredDataReviewCount: string;
}

export interface StrapiHomepageRaw {
  hero: {
    badge: string;
    titleText: string;
    titleHighlight: string;
    subtitle: string;
    ctaLabel: string;
    ctaHref: string;
    trustBadges: Array<{ iconUrl: string; text: string }>;
  };
  features: {
    sectionTitle: string;
    items: Array<{
      title: string;
      desc: string;
      iconUrl: string;
      large: boolean;
    }>;
  };
  trust: {
    sectionTitle: string;
    body: string;
    stats: Array<{ value: string; label: string; iconUrl: string }>;
  };
  products: {
    sectionTitle: string;
    items: Array<{
      title: string;
      desc: string;
      iconUrl: string;
      linkText: string;
    }>;
  };
  threatCards: {
    sectionTitle: string;
    sectionSubtitle: string;
    items: Array<{
      title: string;
      desc: string;
      color: string;
      linkText: string;
    }>;
  };
  cta: {
    title: string;
    subtitle: string;
    ctaLabel: string;
    ctaHref: string;
  };
  testimonials: {
    sectionTitle: string;
    sectionSubtitle: string;
    items: Array<{ name: string; role: string; stars: number; text: string }>;
  };
}

export interface StrapiSeoPageRaw {
  Title: string;
  Slug: string;
  MetaTitle: string;
  MetaDescription: string;
  HeroTitle: string;
  HeroDescription: StrapiRichTextBlock[];
  Content: StrapiRichTextBlock[];
  FeaturedImage: StrapiAttr<StrapiMediaItem>[];
  Faq: Array<{ question: string; answer: StrapiRichTextBlock[] }>;
  Services: Array<{ title: string; description: string; iconUrl: string }>;
  Testimonials: Array<{
    name: string;
    role: string;
    stars: number;
    text: string;
  }>;
  Stats: Array<{ value: string; label: string; iconUrl: string }>;
}

// ── Rich Text Types ──

export interface StrapiRichTextBlock {
  type: string;
  level?: number;
  format?: string;
  children: StrapiRichTextNode[];
  url?: string;
  alternativeText?: string | null;
}

export interface StrapiRichTextNode {
  type: string;
  text?: string;
  url?: string;
  bold?: boolean;
  italic?: boolean;
  children?: StrapiRichTextNode[];
}

// ── Normalized App Types (camelCase, used by components) ──

export interface NavLink {
  label: string;
  href: string;
  active?: boolean;
  children?: {
    label: string;
    href: string;
  }[];
}

export interface NavigationData {
  logoText: string;
  logoImageUrl?: string;
  links: NavLink[];
  ctaLabel: string;
  ctaHref: string;
}

export interface FooterData {
  tagline: string;
  socials: Array<{ label: string; href: string }>;
  linkGroups: Array<{
    title: string;
    links: Array<{ label: string; href: string }>;
  }>;
  newsletter: {
    title: string;
    description: string;
    placeholder: string;
    buttonLabel: string;
  };
  copyright: string;
}

export interface SeoDefaultsData {
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
  structuredData: {
    name: string;
    applicationCategory: string;
    price: string;
    priceCurrency: string;
    offerDescription: string;
    ratingValue: string;
    reviewCount: string;
  };
}

export interface HomepageData {
  hero: {
    badge: string;
    titleText: string;
    titleHighlight: string;
    subtitle: string;
    ctaLabel: string;
    ctaHref: string;
    trustBadges: Array<{ iconUrl: string; text: string }>;
  };
  features: {
    sectionTitle: string;
    items: Array<{
      title: string;
      desc: string;
      iconUrl: string;
      large: boolean;
    }>;
  };
  trust: {
    sectionTitle: string;
    body: string;
    stats: Array<{ value: string; label: string; iconUrl: string }>;
  };
  products: {
    sectionTitle: string;
    items: Array<{
      title: string;
      desc: string;
      iconUrl: string;
      linkText: string;
    }>;
  };
  threatCards: {
    sectionTitle: string;
    sectionSubtitle: string;
    items: Array<{
      title: string;
      desc: string;
      color: string;
      linkText: string;
    }>;
  };
  cta: {
    title: string;
    subtitle: string;
    ctaLabel: string;
    ctaHref: string;
  };
  testimonials: {
    sectionTitle: string;
    sectionSubtitle: string;
    items: Array<{ name: string; role: string; stars: number; text: string }>;
  };
}

export interface SeoPageData {
  id: number;
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroDescription: StrapiRichTextBlock[];
  content: StrapiRichTextBlock[];
  featuredImageUrl: string;
  faq: Array<{ question: string; answer: StrapiRichTextBlock[] }>;
  services: Array<{ title: string; description: string; iconUrl: string }>;
  testimonials: Array<{
    name: string;
    role: string;
    stars: number;
    text: string;
  }>;
  stats: Array<{ value: string; label: string; iconUrl: string }>;
}

// ── About Page ──

export interface StrapiAboutPageRaw {
  Hero: {
    badge: string;
    titleText: string;
    titleHighlight: string;
    subtitle: string;
    illustrationUrl: string | null;
  };
  Mission: {
    sectionTitle: string;
    body: any; // rich text array or string
    stats: Array<{ value: string; label: string; iconUrl?: string | null }>;
  };
  Values: Array<{
    sectionTitle: string;
    sectionSubtitle: string;
    items?: Array<{
      title: string;
      description?: string;
      desc?: string;
      iconUrl?: string | null;
    }>;
  }>;
  Story: {
    sectionTitle: string;
    body: any; // rich text array or string
    timeline?: Array<{
      year: string;
      title: string;
      desc?: string;
      description?: string;
    }>;
    highlights?: Array<{
      year: string;
      title: string;
      desc?: string;
      description?: string;
    }>;
  };
  CTA: {
    title: string;
    subtitle: string;
    ctaLabel: string;
    ctaHref: string;
  };
}

export interface AboutPageData {
  hero: {
    badge: string;
    titleText: string;
    titleHighlight: string;
    subtitle: string;
    illustrationUrl: string;
  };
  mission: {
    sectionTitle: string;
    body: string;
    stats: Array<{ value: string; label: string }>;
  };
  values: {
    sectionTitle: string;
    sectionSubtitle: string;
    items: Array<{ title: string; desc: string; iconUrl: string }>;
  };
  story: {
    sectionTitle: string;
    body: string;
    highlights: Array<{ year: string; title: string; desc: string }>;
  };
  cta: {
    title: string;
    subtitle: string;
    ctaLabel: string;
    ctaHref: string;
  };
}

// ── Solution Page (Dynamic Zone) ──

export interface SolutionHeroSection {
  __component: "sections.hero";
  badge: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string;
}

export interface SolutionContentSection {
  __component: "sections.content";
  title: string;
  body: string;
  imageUrl: string;
}

export interface SolutionFeatureItem {
  title: string;
  description: string;
  iconUrl: string;
  imageUrl: string;
}

export interface SolutionFeatureGridSection {
  __component: "sections.feature-grid";
  sectionTitle: string;
  sectionSubtitle: string;
  items: SolutionFeatureItem[];
}

export interface SolutionProcessStep {
  title: string;
  description: string;
  imageUrl: string;
}

export interface SolutionProcessSection {
  __component: "sections.process";
  title: string;
  steps: SolutionProcessStep[];
}

export interface SolutionProtectionLevel {
  title: string;
  description: string;
  iconUrl: string;
}

export interface SolutionProtectionLevelsSection {
  __component: "sections.protection-levels";
  title: string;
  items: SolutionProtectionLevel[];
}

export interface SolutionBenefitItem {
  title: string;
  description: string;
  iconUrl: string;
}

export interface SolutionBenefitsSection {
  __component: "sections.benefits";
  title: string;
  items: SolutionBenefitItem[];
}

export interface SolutionStat {
  value: string;
  label: string;
  iconUrl: string;
}

export interface SolutionStatsSection {
  __component: "sections.stats";
  items: SolutionStat[];
}

export interface SolutionFaqItem {
  question: string;
  answer: string;
}

export interface SolutionFaqSection {
  __component: "sections.faq";
  title: string;
  items: SolutionFaqItem[];
}

export interface SolutionCtaSection {
  __component: "sections.cta";
  title: string;
  subtitle: string;
  buttonLabel: string;
  buttonHref: string;
  imageUrl: string;
}

export type SolutionSection =
  | SolutionHeroSection
  | SolutionContentSection
  | SolutionFeatureGridSection
  | SolutionProcessSection
  | SolutionProtectionLevelsSection
  | SolutionBenefitsSection
  | SolutionStatsSection
  | SolutionFaqSection
  | SolutionCtaSection;

export interface SolutionPageData {
  id: number;
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  herosection: any[];
  features: any[];
  Richtext: any[];
  process: any[];
  protections: any[];
  benefits: any[];
  stats: any[];
  faqs: any[];
  cta: any[];
  PricingTable: PricingTableData | null;
}

export interface PricingTableData {
  id: number;
  title: string;
  subtitle: any[];
  plans: PricingPlan[];
}

export interface PricingPlan {
  id: number;
  name: string;
  monthlyPrice: string;
  annualPrice: string;
  featured: boolean | null;
  features: PricingFeature[];
}

export interface PricingFeature {
  id: number;
  label: string;
  value: string;
}

export interface StrapiSolutionRaw {
  id: number;
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  herosection: any[];
  features: any[];
  Richtext: any[];
  process: any[];
  protections: any[];
  benefits: any[];
  stats: any[];
  faqs: any[];
  cta: any[];
}
