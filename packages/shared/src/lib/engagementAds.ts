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
  promoted_icon_img: ThemedValue;
  promoted_gradient_start: ThemedValue;
  promoted_gradient_end: ThemedValue;
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
  icon: string;
  primaryColor: string;
  secondaryColor: string;
  tools: string[];
  keywords: string[];
  tags: string[];
}

const resolveThemed = (value: ThemedValue, isLight: boolean): string =>
  isLight ? value.light : value.dark;

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
  logo: resolveThemed(creative.promoted_logo_img, isLight),
  icon: resolveThemed(creative.promoted_icon_img, isLight),
  primaryColor: resolveThemed(creative.promoted_gradient_start, isLight),
  secondaryColor: resolveThemed(creative.promoted_gradient_end, isLight),
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

/** Find the first creative whose tools list includes the given tool name */
export const findCreativeForTool = (
  creatives?: ResolvedCreative[],
  toolName?: string | null,
): ResolvedCreative | null => {
  if (!toolName || !creatives?.length) {
    return null;
  }

  const lower = toolName.toLowerCase().trim();

  return (
    creatives.find((c) => c.tools.some((t) => t.toLowerCase() === lower)) ??
    null
  );
};
