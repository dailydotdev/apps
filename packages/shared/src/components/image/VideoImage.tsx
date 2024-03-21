import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { PlayIcon } from '../icons';
import { IconSize } from '../Icon';
import { ImageProps, ImageType } from './Image';
import { CardImage } from '../cards/Card';

export interface VideoImageProps {
  size?: IconSize;
  className?: string;
  overlay?: ReactNode;
  imageProps: ImageProps;
  CardImageComponent?: typeof CardImage;
}

const defaultOverlay = (
  <span className="absolute h-full w-full bg-overlay-tertiary-black" />
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
        'relative flex h-auto max-h-fit w-full items-center justify-center overflow-hidden rounded-12',
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
