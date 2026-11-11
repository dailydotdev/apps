import { parseHttpUrl } from '../../../lib/links';
import { REFERENCE_RATIO } from './sponsorLogoSizing';

export enum SponsorTier {
  /** One slot, static, always leftmost. Never enters a rotation deck. */
  Gold = 'gold',
  Premium = 'premium',
  Community = 'community',
}

/**
 * One advertiser in an `advertiser_bar` response (snake_case JSON). There is
 * no tier field: an advertiser's tier is the group it arrives in, which
 * `parseSponsors` stamps on.
 */
export interface SponsorStripCreative {
  generation_id: string;
  company_name: string;
  icon?: string;
  icon_light?: string;
  icon_dark?: string;
  link: string;
  pixels: string[];
  tier: SponsorTier;
}

type SponsorStripAdvertiser = Omit<SponsorStripCreative, 'tier'>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const iconKeys = ['icon', 'icon_light', 'icon_dark'] as const;

const parseAdvertiser = (raw: unknown): SponsorStripAdvertiser | null => {
  if (!isRecord(raw)) {
    return null;
  }

  const link = parseHttpUrl(raw.link);
  const { pixels = [] } = raw;
  const icons = iconKeys.filter((key) => key in raw);

  if (
    typeof raw.generation_id !== 'string' ||
    typeof raw.company_name !== 'string' ||
    icons.some(
      (key) => raw[key] !== undefined && typeof raw[key] !== 'string',
    ) ||
    link === null ||
    !Array.isArray(pixels) ||
    !pixels.every((pixel) => typeof pixel === 'string') ||
    !iconKeys.some((key) => raw[key])
  ) {
    return null;
  }

  return {
    generation_id: raw.generation_id,
    company_name: raw.company_name,
    ...Object.fromEntries(icons.map((key) => [key, raw[key]])),
    link,
    pixels: [...pixels],
  };
};

const groupKeys = ['pinned', 'top_tier', 'community'] as const;

/**
 * The placement's own envelope. Each group is optional so a bar sold with only
 * a pinned advertiser still parses, and the advertisers inside stay `unknown`
 * so one malformed entry costs its own slot rather than the whole group.
 */
const parseAdvertiserBar = (
  raw: unknown,
): Record<(typeof groupKeys)[number], unknown[]> | null => {
  const bar =
    isRecord(raw) && isRecord(raw.value) ? raw.value.advertiser_bar : undefined;

  if (
    !isRecord(bar) ||
    groupKeys.some((key) => bar[key] !== undefined && !Array.isArray(bar[key]))
  ) {
    return null;
  }

  const group = (key: (typeof groupKeys)[number]): unknown[] => {
    const value = bar[key];
    return Array.isArray(value) ? [...value] : [];
  };

  return {
    pinned: group('pinned'),
    top_tier: group('top_tier'),
    community: group('community'),
  };
};

const withTier = (
  advertisers: unknown[],
  tier: SponsorTier,
): SponsorStripCreative[] =>
  advertisers.flatMap((raw) => {
    const advertiser = parseAdvertiser(raw);
    return advertiser ? [{ ...advertiser, tier }] : [];
  });

/**
 * Flatten the bar's three groups into one tiered list, which is the vocabulary
 * the slots, the decks and the logging already speak. `pinned` is the slot that
 * never shares, so it maps to gold; a second pinned advertiser is dropped
 * downstream rather than demoted.
 */
export const parseSponsors = (raw: unknown): SponsorStripCreative[] => {
  // `/v1/a/*` answers with a list of placements even when one was asked for.
  const bar = parseAdvertiserBar(Array.isArray(raw) ? raw[0] : raw);

  if (!bar) {
    return [];
  }

  const { pinned, top_tier: topTier, community } = bar;

  return [
    ...withTier(pinned, SponsorTier.Gold),
    ...withTier(topTier, SponsorTier.Premium),
    ...withTier(community, SponsorTier.Community),
  ];
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

export const getSponsorLogo = (
  sponsor: ResolvedSponsor,
  isLightTheme: boolean,
): string =>
  (isLightTheme ? sponsor.logoLight : sponsor.logoDark) ||
  sponsor.logoLight ||
  sponsor.logoDark ||
  sponsor.logo;
