import React from 'react';
import type { ReactElement } from 'react';
import { useConditionalFeature } from '../../../../hooks';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { adFavicon } from '../../../../lib/featureManagement';
import { ProfileImageSize, ProfilePicture } from '../../../ProfilePicture';
import { apiUrl } from '../../../../lib/config';
import { CardHeader } from '../../common/Card';
import type { Ad } from '../../../../graphql/posts';

type AdFaviconProps = {
  ad: Ad;
  className?: string;
};
export const AdFavicon = ({ ad, className }: AdFaviconProps): ReactElement => {
  const { user } = useAuthContext();
  const pixelRatio = globalThis?.window.devicePixelRatio ?? 1;
  const iconSize = Math.round(24 * pixelRatio);
  const isPlus = user?.isPlus || false;
  const { value: showAdFavicon } = useConditionalFeature({
    feature: adFavicon,
    shouldEvaluate: !isPlus,
  });

  if (!showAdFavicon) {
    return <></>;
  }

  return (
    <CardHeader className={className}>
      <ProfilePicture
        size={ProfileImageSize.Medium}
        user={{
          id: ad.link,
          image: `${apiUrl}/icon?url=${encodeURIComponent(
            ad.link,
          )}&size=${iconSize}`,
          username: ad.description,
        }}
        nativeLazyLoading
      />
    </CardHeader>
  );
};
