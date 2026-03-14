import type { Ad } from '../../../../graphql/posts';
import { apiUrl } from '../../../../lib/config';
import { adFaviconPlaceholder } from '../../../../lib/image';

interface GetAdFaviconImageLinkParams {
  ad: Ad;
  adImprovementsV3: boolean;
  size?: number;
}

const minimumFaviconSize = 96;

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
  const iconSize = Math.max(Math.round(size * pixelRatio), minimumFaviconSize);

  return `${apiUrl}/icon?url=${encodeURIComponent(
    ad.adDomain,
  )}&size=${iconSize}`;
};
