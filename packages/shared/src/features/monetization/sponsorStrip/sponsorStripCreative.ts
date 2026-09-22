import { z } from 'zod';
import { urlParseSchema } from '../../../lib/links';
import { REFERENCE_RATIO } from './sponsorLogoSizing';

export enum SponsorTier {
  /** One slot, static, always leftmost. Never enters a rotation deck. */
  Gold = 'gold',
  Premium = 'premium',
  Community = 'community',
}

/**
 * Raw shape of one advertiser in an `advertiser_bar` response (snake_case
 * JSON). There is no tier field: an advertiser's tier is the group it arrives
 * in, which `parseSponsors` stamps on.
 */
const advertiserSchema = z
  .object({
    generation_id: z.string(),
    company_name: z.string(),
    icon: z.string().optional(),
    icon_light: z.string().optional(),
    icon_dark: z.string().optional(),
    link: urlParseSchema,
    pixels: z.array(z.string()).optional().default([]),
  })
  .refine(({ icon, icon_light: light, icon_dark: dark }) =>
    Boolean(icon || light || dark),
  );

/**
 * The placement's own envelope. Each group is optional so a bar sold with only
 * a pinned advertiser still parses, and the advertisers inside stay `unknown`
 * so one malformed entry costs its own slot rather than the whole group.
 */
const advertiserBarSchema = z.object({
  value: z.object({
    advertiser_bar: z.object({
      pinned: z.array(z.unknown()).optional().default([]),
      top_tier: z.array(z.unknown()).optional().default([]),
      community: z.array(z.unknown()).optional().default([]),
    }),
  }),
});

export type SponsorStripCreative = z.infer<typeof advertiserSchema> & {
  tier: SponsorTier;
};

/** A creative with everything the row draws it from. */
export interface ResolvedSponsor {
  genId: string;
  company: string;
  logo: string;
  logoLight?: string;
  logoDark?: string;
  ratio: number;
  link: string;
  pixel: string[];
  tier: SponsorTier;
}

const withTier = (
  advertisers: unknown[],
  tier: SponsorTier,
): SponsorStripCreative[] =>
  advertisers.flatMap((advertiser) => {
    const result = advertiserSchema.safeParse(advertiser);
    return result.success ? [{ ...result.data, tier }] : [];
  });

/**
 * Flatten the bar's three groups into one tiered list, which is the vocabulary
 * the slots, the decks and the logging already speak. `pinned` is the slot that
 * never shares, so it maps to gold; a second pinned advertiser is dropped
 * downstream rather than demoted.
 */
export const parseSponsors = (raw: unknown): SponsorStripCreative[] => {
  // `/v1/a/*` answers with a list of placements even when one was asked for.
  const result = advertiserBarSchema.safeParse(
    Array.isArray(raw) ? raw[0] : raw,
  );

  if (!result.success) {
    return [];
  }

  const {
    pinned,
    top_tier: topTier,
    community,
  } = result.data.value.advertiser_bar;

  return [
    ...withTier(pinned, SponsorTier.Gold),
    ...withTier(topTier, SponsorTier.Premium),
    ...withTier(community, SponsorTier.Community),
  ];
};

/** The image's intrinsic ratio replaces this fallback once it loads. */
export const resolveSponsor = (
  creative: SponsorStripCreative,
): ResolvedSponsor => ({
  genId: creative.generation_id,
  company: creative.company_name,
  logo: creative.icon || creative.icon_light || creative.icon_dark || '',
  logoLight: creative.icon_light,
  logoDark: creative.icon_dark,
  ratio: REFERENCE_RATIO,
  link: creative.link,
  pixel: creative.pixels,
  tier: creative.tier,
});
