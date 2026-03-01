import React from 'react';
import type { ReactElement } from 'react';
import { ProfileImageSize, ProfilePicture } from '../../../ProfilePicture';
import { CardHeader } from '../../common/Card';
import type { Ad } from '../../../../graphql/posts';
import { adFaviconPlaceholder } from '../../../../lib/image';
import { useFeature } from '../../../GrowthBookProvider';
import { adImprovementsV3Feature } from '../../../../lib/featureManagement';
import { getAdFaviconImageLink } from './getAdFaviconImageLink';

type AdFaviconProps = {
  ad: Ad;
  className?: string;
};
export const AdFavicon = ({ ad, className }: AdFaviconProps): ReactElement => {
  const adImprovementsV3 = useFeature(adImprovementsV3Feature);
  const imageLink = getAdFaviconImageLink({
    ad,
    adImprovementsV3,
    size: 24,
  });
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
