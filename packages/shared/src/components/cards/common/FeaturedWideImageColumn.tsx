import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { HIGH_PRIORITY_IMAGE_PROPS, Image, ImageType } from '../../image/Image';
import { PlayIcon } from '../../icons';
import { IconSize } from '../../Icon';
import type { FeaturedWideColSpan } from './featuredWide';
import { IMAGE_COL_SPAN } from './featuredWide';

export type FeaturedWideImageColumnProps = {
  image: string;
  alt: string;
  wideColSpan: FeaturedWideColSpan;
  overlay?: ReactNode;
  isVideoType?: boolean;
  eagerLoadImage?: boolean;
};

export const FeaturedWideImageColumn = ({
  image,
  alt,
  wideColSpan,
  overlay,
  isVideoType,
  eagerLoadImage,
}: FeaturedWideImageColumnProps): ReactElement => (
  <div
    className={classNames(
      'relative flex h-full min-w-0 items-center justify-center overflow-hidden rounded-r-16',
      IMAGE_COL_SPAN[wideColSpan],
    )}
  >
    <Image
      aria-hidden
      alt=""
      src={image}
      type={ImageType.Post}
      className="absolute inset-0 size-full scale-110 object-cover blur-xl"
    />
    {overlay}
    {isVideoType && !overlay && (
      <>
        <span
          aria-hidden
          className="absolute inset-0 bg-overlay-tertiary-black"
        />
        <PlayIcon
          secondary
          size={IconSize.XXLarge}
          data-testid="playIconVideoPost"
          className="absolute"
        />
      </>
    )}
    <Image
      alt={alt}
      src={image}
      type={ImageType.Post}
      className={classNames(
        'relative size-full object-contain',
        !!overlay && 'opacity-16',
      )}
      {...(eagerLoadImage ? HIGH_PRIORITY_IMAGE_PROPS : {})}
    />
  </div>
);
