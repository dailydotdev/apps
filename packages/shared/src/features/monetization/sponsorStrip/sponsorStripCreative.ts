import { z } from 'zod';
import { urlParseSchema } from '../../../lib/links';

export enum SponsorTier {
  /** One slot, static, always leftmost. Never enters a rotation deck. */
  Gold = 'gold',
  Premium = 'premium',
  Community = 'community',
}

const themedStringSchema = z.object({
  dark: z.string(),
  light: z.string(),
});

/**
 * Raw shape of a `footer_logo` creative from the ad server (snake_case JSON),
 * matching how engagement-ad creatives arrive.
 */
export const sponsorStripCreativeSchema = z.object({
  gen_id: z.string(),
  company: z.string(),
  logo_img: themedStringSchema,
  /**
   * Intrinsic width / height. Logo files run from square marks to 6:1
   * lockups, so a row that fixes the height needs the ratio to size the
   * mark optically rather than letting a long lockup dominate.
   */
  logo_ratio: z.number().positive(),
  link: urlParseSchema,
  pixel: z.array(z.string()).optional().default([]),
  /**
   * An unknown tier lands in community rather than dropping the creative: an
   * unranked advertiser still earns its impression, an absent one does not.
   */
  tier: z.enum(SponsorTier).catch(SponsorTier.Community),
});

export type SponsorStripCreative = z.infer<typeof sponsorStripCreativeSchema>;
export type ThemedValue = z.infer<typeof themedStringSchema>;

/** A creative with its themed logo resolved to the current theme. */
export interface ResolvedSponsor {
  genId: string;
  company: string;
  logo: string;
  ratio: number;
  link: string;
  pixel: string[];
  tier: SponsorTier;
}

export const parseSponsors = (raw: unknown): SponsorStripCreative[] => {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.flatMap((creative) => {
    const result = sponsorStripCreativeSchema.safeParse(creative);
    return result.success ? [result.data] : [];
  });
};

export const resolveSponsor = (
  creative: SponsorStripCreative,
  isLight: boolean,
): ResolvedSponsor => ({
  genId: creative.gen_id,
  company: creative.company,
  logo: isLight ? creative.logo_img.light : creative.logo_img.dark,
  ratio: creative.logo_ratio,
  link: creative.link,
  pixel: creative.pixel,
  tier: creative.tier,
});
