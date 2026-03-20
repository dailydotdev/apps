/**
 * Engagement Ads (Micro-Interaction Ads) — Types
 *
 * Defines the raw API shape from boot and the resolved creative type
 * used by all downstream components.
 */

/** Dark/light theme-aware value from the API */
export interface ThemedValue {
  dark: string;
  light: string;
}

/** Raw shape from boot API (snake_case JSON) */
export interface EngagementCreative {
  gen_id: string;
  promoted_name: string;
  promoted_body: string;
  promoted_cta: string;
  promoted_url: string;
  promoted_logo_img: ThemedValue;
  promoted_background_img: ThemedValue;
  promoted_icon_img: ThemedValue;
  promoted_primary_color: ThemedValue;
  promoted_secondary_color: ThemedValue;
  tools: string[];
  keywords: string[];
  tags: string[];
}

/** EngagementCreative with themed values resolved to the current theme */
export interface ResolvedCreative {
  genId: string;
  name: string;
  body: string;
  cta: string;
  url: string;
  logo: string;
  background: string;
  icon: string;
  primaryColor: string;
  secondaryColor: string;
  tools: string[];
  keywords: string[];
  tags: string[];
}

/** Resolve a raw creative to the current theme */
export const resolveCreative = (
  creative: EngagementCreative,
  isLight: boolean,
): ResolvedCreative => ({
  genId: creative.gen_id,
  name: creative.promoted_name,
  body: creative.promoted_body,
  cta: creative.promoted_cta,
  url: creative.promoted_url,
  logo: isLight
    ? creative.promoted_logo_img.light
    : creative.promoted_logo_img.dark,
  background: isLight
    ? creative.promoted_background_img.light
    : creative.promoted_background_img.dark,
  icon: isLight
    ? creative.promoted_icon_img.light
    : creative.promoted_icon_img.dark,
  primaryColor: isLight
    ? creative.promoted_primary_color.light
    : creative.promoted_primary_color.dark,
  secondaryColor: isLight
    ? creative.promoted_secondary_color.light
    : creative.promoted_secondary_color.dark,
  tools: creative.tools,
  keywords: creative.keywords,
  tags: creative.tags,
});

/** Find the first creative whose tags overlap with the given tags */
export const findCreativeForTags = (
  creatives?: ResolvedCreative[],
  tags?: string[],
): ResolvedCreative | null => {
  if (!tags?.length || !creatives?.length) {
    return null;
  }

  const lowerTags = tags.map((t) => t.toLowerCase());

  return (
    creatives.find((c) => c.tags.some((t) => lowerTags.includes(t))) ?? null
  );
};
