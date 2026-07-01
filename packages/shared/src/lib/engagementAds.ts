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

/**
 * Prominent placements a campaign can opt into, on top of the always-on
 * micro-interactions (branded upvote animation, highlighted words, sponsored
 * tag, mentioned-tools widget). These are campaign-specific: a creative only
 * renders a banner/strip if it explicitly lists the placement, so they never
 * fire for every engagement creative.
 */
export enum EngagementPlacement {
  TopBanner = 'top_banner',
  FeedStrip = 'feed_strip',
}

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
  keywords: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()),
  // Kept as a loose string array so an unknown/future placement value never
  // fails the whole creative's parse (which would also drop its
  // micro-interactions). Matching against EngagementPlacement is done at
  // lookup time in findCreativeForPlacement.
  placements: z.array(z.string()).optional().default([]),
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
  placements: string[];
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
  placements: creative.placements,
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

/**
 * Find the first creative that has opted into a prominent placement
 * (top banner / in-feed strip). Returns null when no campaign declares it, so
 * these surfaces stay campaign-specific rather than firing for every creative.
 */
export const findCreativeForPlacement = (
  creatives: ResolvedCreative[] | undefined,
  placement: EngagementPlacement,
): ResolvedCreative | null => {
  if (!creatives?.length) {
    return null;
  }

  return creatives.find((c) => c.placements.includes(placement)) ?? null;
};
