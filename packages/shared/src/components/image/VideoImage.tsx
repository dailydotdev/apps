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
  /** Extra classes for the default dark tint (e.g. full-bleed in glass mode). */
  overlayClassName?: string;
  imageProps: ImageProps;
  CardImageComponent?: typeof CardImage;
}

const VideoImage = ({
  size = IconSize.XXLarge,
  imageProps,
  className,
  overlay,
  overlayClassName,
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
      {overlay || (
        <span
          className={classNames(
            'absolute inset-y-0 left-1 right-1 h-full rounded-12 bg-overlay-tertiary-black',
            overlayClassName,
          )}
        />
      )}
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
