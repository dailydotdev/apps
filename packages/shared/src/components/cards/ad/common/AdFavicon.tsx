import React from 'react';
import type { ReactElement } from 'react';
import { ProfileImageSize, ProfilePicture } from '../../../ProfilePicture';
import { CardHeader } from '../../common/Card';
import type { Ad } from '../../../../graphql/posts';
import { adFaviconPlaceholder } from '../../../../lib/image';
import { apiUrl } from '../../../../lib/config';
import { useFeature } from '../../../GrowthBookProvider';
import { adImprovementsV2Feature } from '../../../../lib/featureManagement';

const pixelRatio = globalThis?.window?.devicePixelRatio ?? 1;
const iconSize = Math.round(24 * pixelRatio);

type AdFaviconProps = {
  ad: Ad;
  className?: string;
};
export const AdFavicon = ({ ad, className }: AdFaviconProps): ReactElement => {
  const adImprovementsV2 = useFeature(adImprovementsV2Feature);
  const imageLink =
    adImprovementsV2 && ad?.adDomain
      ? `${apiUrl}/icon?url=${encodeURIComponent(ad.adDomain)}&size=${iconSize}`
      : adFaviconPlaceholder;
  return (
    <CardHeader className={className}>
      <ProfilePicture
        rounded="full"
        size={ProfileImageSize.Medium}
        fallbackSrc={adFaviconPlaceholder}
        user={{
          id: ad.link,
          image: imageLink,
          username: ad.description,
        }}
        nativeLazyLoading
      />
    </CardHeader>
  );
};
