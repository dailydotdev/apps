/**
 * Engagement Ads (Micro-Interaction Ads) — Types
 *
 * Defines the raw API shape (boot or the engagementCreatives query) and the
 * resolved creative type used by all downstream components.
 */
import { parseHttpUrl } from './links';

export interface ThemedValue {
  dark: string;
  light: string;
}

/** Raw shape from the API (snake_case JSON) */
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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const parseThemed = (value: unknown): ThemedValue | null =>
  isRecord(value) &&
  typeof value.dark === 'string' &&
  typeof value.light === 'string'
    ? { dark: value.dark, light: value.light }
    : null;

const parseCreative = (raw: unknown): EngagementCreative | null => {
  if (!isRecord(raw)) {
    return null;
  }

  const url = parseHttpUrl(raw.promoted_url);
  const logo = parseThemed(raw.promoted_logo_img);
  const icon = parseThemed(raw.promoted_icon_img);
  const gradientStart = parseThemed(raw.promoted_gradient_start);
  const gradientEnd = parseThemed(raw.promoted_gradient_end);
  const { keywords = [] } = raw;

  if (
    typeof raw.gen_id !== 'string' ||
    typeof raw.promoted_name !== 'string' ||
    typeof raw.promoted_body !== 'string' ||
    typeof raw.promoted_cta !== 'string' ||
    url === null ||
    !logo ||
    !icon ||
    !gradientStart ||
    !gradientEnd ||
    !isStringArray(raw.tools) ||
    !isStringArray(keywords) ||
    !isStringArray(raw.tags)
  ) {
    return null;
  }

  return {
    gen_id: raw.gen_id,
    promoted_name: raw.promoted_name,
    promoted_body: raw.promoted_body,
    promoted_cta: raw.promoted_cta,
    promoted_url: url,
    promoted_logo_img: logo,
    promoted_icon_img: icon,
    promoted_gradient_start: gradientStart,
    promoted_gradient_end: gradientEnd,
    tools: [...raw.tools],
    keywords: [...keywords],
    tags: [...raw.tags],
  };
};

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

/**
 * Validate raw creatives against the schema.
 * Silently drops creatives whose URLs are not https:// (or are malformed).
 */
export const parseCreatives = (rawCreatives: unknown): EngagementCreative[] => {
  if (!Array.isArray(rawCreatives)) {
    return [];
  }

  return rawCreatives.flatMap((raw) => {
    const creative = parseCreative(raw);
    return creative ? [creative] : [];
  });
};

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

/**
 * Build the engagement-ad tracking `extra` payload for a creative. Shared so
 * every surface that attributes an engagement creative reports it the same way.
 */
export const getEngagementLogExtra = (
  creative: Pick<ResolvedCreative, 'genId'>,
): { gen_id: string } => ({
  gen_id: creative.genId,
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
