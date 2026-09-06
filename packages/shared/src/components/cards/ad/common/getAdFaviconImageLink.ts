import type { Ad } from '../../../../graphql/posts';
import { adFaviconPlaceholder } from '../../../../lib/image';
import { getSiteIconUrl } from '../../../../lib/links';

interface GetAdFaviconImageLinkParams {
  ad: Ad;
  adImprovementsV3?: boolean;
  size?: number;
}

export const getAdFaviconImageLink = ({
  ad,
  adImprovementsV3,
  size = 24,
}: GetAdFaviconImageLinkParams): string => {
  if (ad?.companyLogo) {
    return ad.companyLogo;
  }

  if (!adImprovementsV3 || !ad?.adDomain) {
    return adFaviconPlaceholder;
  }

  const pixelRatio = globalThis?.window?.devicePixelRatio ?? 1;

  return getSiteIconUrl({ url: ad.adDomain, size: size * pixelRatio });
};
