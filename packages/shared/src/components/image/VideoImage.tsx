import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { PlayIcon } from '../icons';
import { IconSize } from '../Icon';
import type { ImageProps } from './Image';
import { ImageType } from './Image';
import { CardImage } from '../cards/common/Card';

export interface VideoImageProps {
  size?: IconSize;
  className?: string;
  overlay?: ReactNode;
  imageProps: ImageProps;
  CardImageComponent?: typeof CardImage;
}

const defaultOverlay = (
  <span className="bg-overlay-tertiary-black absolute h-full w-full" />
);

const VideoImage = ({
  size = IconSize.XXLarge,
  imageProps,
  className,
  overlay,
  CardImageComponent = CardImage,
}: VideoImageProps): ReactElement => {
  return (
    <div
      className={classNames(
        className,
        !overlay && 'pointer-events-none',
        'rounded-12 relative flex h-auto max-h-fit w-full items-center justify-center overflow-hidden',
      )}
    >
      {overlay || defaultOverlay}
      {!overlay && (
        <PlayIcon
          secondary
          size={size}
          data-testid="playIconVideoPost"
          className="absolute"
        />
      )}
      <CardImageComponent {...imageProps} type={ImageType.Post} />
    </div>
  );
};

export default VideoImage;
