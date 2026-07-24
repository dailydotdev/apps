import type { Ad } from '../../graphql/posts';
import type {
  AdvertiserCampaign,
  AdvertiserPlacement,
  ResolvedCreative,
} from './types';
import { activeCampaigns } from './registry';

// Full click destination: landing page + the tracker's UTM string (if any).
export const getPlacementLink = (placement: AdvertiserPlacement): string =>
  placement.utm
    ? `${placement.landingPage}?${placement.utm}`
    : placement.landingPage;

// Flatten every placement across the given campaigns into resolved creatives,
// each paired with its campaign so the card has the brand at render time.
export const getCreatives = (
  campaigns: AdvertiserCampaign[] = activeCampaigns,
): ResolvedCreative[] =>
  campaigns.flatMap((campaign) =>
    campaign.placements.map((placement) => ({ campaign, placement })),
  );

// Map a resolved creative onto the real `Ad` shape so it can flow through the
// same props the live ad cards expect. No `callToAction` — feed (Display) ads
// have no CTA button, matching Carbon/EthicalAds ads and the campaign spec
// (the tracker's CTA column is email-digest only).
export const buildAd = ({ campaign, placement }: ResolvedCreative): Ad => ({
  company: campaign.brand.name,
  source: campaign.brand.name,
  description: placement.headline,
  link: getPlacementLink(placement),
  image: placement.image,
  companyLogo: campaign.brand.logo,
  matchingTags: placement.tags,
});

// Deterministic pick from a numeric seed across the whole active pool, so a
// given (mount, slot) pair is stable across re-renders but reshuffles when the
// feed remounts on refresh.
export const pickCreative = (
  seed: number,
  campaigns: AdvertiserCampaign[] = activeCampaigns,
): ResolvedCreative | undefined => {
  const creatives = getCreatives(campaigns);
  if (creatives.length === 0) {
    return undefined;
  }
  const index =
    ((Math.floor(seed) % creatives.length) + creatives.length) %
    creatives.length;
  return creatives[index];
};
