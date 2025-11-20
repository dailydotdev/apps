import React from 'react';
import type { ReactElement } from 'react';
import { ProfileImageSize, ProfilePicture } from '../../../ProfilePicture';
import { CardHeader } from '../../common/Card';
import type { Ad } from '../../../../graphql/posts';
import { adFaviconPlaceholder } from '../../../../lib/image';
import { apiUrl } from '../../../../lib/config';

const pixelRatio = globalThis?.window.devicePixelRatio ?? 1;
const iconSize = Math.round(24 * pixelRatio);

type AdFaviconProps = {
  ad: Ad;
  className?: string;
};
export const AdFavicon = ({ ad, className }: AdFaviconProps): ReactElement => {
  return (
    <CardHeader className={className}>
      <ProfilePicture
        rounded="full"
        size={ProfileImageSize.Medium}
        fallbackSrc={adFaviconPlaceholder}
        user={{
          id: ad.link,
          image: ad?.adDomain
            ? `${apiUrl}/icon?url=${encodeURIComponent(
                ad.adDomain,
              )}&size=${iconSize}`
            : adFaviconPlaceholder,
          username: ad.description,
        }}
        nativeLazyLoading
      />
    </CardHeader>
  );
};
