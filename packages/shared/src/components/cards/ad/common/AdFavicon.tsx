import React from 'react';
import type { ReactElement } from 'react';
import { useConditionalFeature } from '../../../../hooks';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { adFavicon } from '../../../../lib/featureManagement';
import { ProfileImageSize, ProfilePicture } from '../../../ProfilePicture';
import { CardHeader } from '../../common/Card';
import type { Ad } from '../../../../graphql/posts';
import { adFaviconPlaceholder } from '../../../../lib/image';

type AdFaviconProps = {
  ad: Ad;
  className?: string;
};
export const AdFavicon = ({ ad, className }: AdFaviconProps): ReactElement => {
  const { user } = useAuthContext();
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
        rounded="full"
        size={ProfileImageSize.Medium}
        user={{
          id: ad.link,
          image: adFaviconPlaceholder,
          username: ad.description,
        }}
        nativeLazyLoading
      />
    </CardHeader>
  );
};
