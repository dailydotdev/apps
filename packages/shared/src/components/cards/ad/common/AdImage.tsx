import type { ComponentType, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Ad } from '../../../../graphql/posts';
import type { ImageProps } from '../../../image/Image';
import { cloudinaryPostImageCoverPlaceholder } from '../../../../lib/image';

export const AdImage = ({
  ad,
  ImageComponent,
  className,
}: {
  ad: Ad;
  ImageComponent: ComponentType<ImageProps>;
  className?: string;
}): ReactElement => {
  const showBlurredImage = ad.source === 'Carbon' || ad.source === 'EthicalAds';

  return (
    <div
      className={classNames(
        'pointer-events-none relative my-2 overflow-hidden rounded-12',
        className,
      )}
    >
      <ImageComponent
        alt="Ad image"
        src={ad.image}
        className={classNames(
          'z-1 w-full',
          showBlurredImage && 'absolute inset-0 m-auto',
        )}
        style={{ objectFit: showBlurredImage ? 'contain' : 'cover' }}
        fallbackSrc={cloudinaryPostImageCoverPlaceholder}
      />
      {showBlurredImage && (
        <ImageComponent
          alt="Ad image background"
          src={ad.image}
          className="-z-1 w-full blur-20"
          fallbackSrc={cloudinaryPostImageCoverPlaceholder}
        />
      )}
    </div>
  );
};
