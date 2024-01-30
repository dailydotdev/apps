import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { PlayIcon } from '../icons';
import { IconSize } from '../Icon';
import { ImageProps, Image } from './Image';

export interface VideoImageProps extends ImageProps {
  size?: IconSize;
  wrapperClassName?: string;
}

const VideoImage = ({
  size = IconSize.XXLarge,
  wrapperClassName,
  ...props
}: VideoImageProps): ReactElement => {
  return (
    <div
      className={classNames(
        wrapperClassName,
        'pointer-events-none relative flex h-auto max-h-fit w-full items-center justify-center rounded-12',
      )}
    >
      <span className="absolute h-full w-full rounded-12 bg-overlay-tertiary-black" />
      <PlayIcon
        secondary
        size={size}
        data-testid="playIconVideoPost"
        className="absolute"
      />
      <Image {...props} />
    </div>
  );
};

export default VideoImage;
