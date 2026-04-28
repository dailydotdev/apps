/**
 * Engagement Ads (Micro-Interaction Ads) — Types
 *
 * Defines the raw API shape from boot and the resolved creative type
 * used by all downstream components.
 */
import { z } from 'zod';
import { urlParseSchema } from './links';

const themedStringSchema = z.object({
  dark: z.string(),
  light: z.string(),
});

/** Raw shape from boot API (snake_case JSON) */
export const engagementCreativeSchema = z.object({
  gen_id: z.string(),
  promoted_name: z.string(),
  promoted_body: z.string(),
  promoted_cta: z.string(),
  promoted_url: urlParseSchema,
  promoted_logo_img: themedStringSchema,
  promoted_icon_img: themedStringSchema,
  promoted_gradient_start: themedStringSchema,
  promoted_gradient_end: themedStringSchema,
  tools: z.array(z.string()),
  keywords: z.array(z.string()),
  tags: z.array(z.string()),
});

export type EngagementCreative = z.infer<typeof engagementCreativeSchema>;
export type ThemedValue = z.infer<typeof themedStringSchema>;

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
    const result = engagementCreativeSchema.safeParse(raw);
    return result.success ? [result.data] : [];
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
