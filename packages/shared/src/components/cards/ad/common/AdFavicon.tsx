import React from 'react';
import type { ReactElement, ReactNode } from 'react';
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
  /** Medium everywhere but the list card, which matches a post's source. */
  size?: ProfileImageSize.Medium | ProfileImageSize.Large;
  /** What shares the header row with the favicon, such as an options menu. */
  children?: ReactNode;
};

export const AdFavicon = ({
  ad,
  className,
  size = ProfileImageSize.Medium,
  children,
}: AdFaviconProps): ReactElement => {
  const adImprovementsV3 = useFeature(adImprovementsV3Feature);
  const imageLink = getAdFaviconImageLink({
    ad,
    adImprovementsV3,
    size: size === ProfileImageSize.Large ? 40 : 24,
  });
  return (
    <CardHeader className={className}>
      <ProfilePicture
        rounded="full"
        size={size}
        fallbackSrc={adFaviconPlaceholder}
        user={{
          id: ad.link,
          image: imageLink,
          username: ad.description,
        }}
        nativeLazyLoading
      />
      {/* The header's own `> button` margin beats ml-auto on the button
          itself; the row keeps the actions right, as a post card's does. */}
      {children && <div className="ml-auto flex">{children}</div>}
    </CardHeader>
  );
};
