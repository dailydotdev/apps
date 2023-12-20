import React, { ReactElement } from 'react';
import classNames from 'classnames';
import PlayIcon from '../icons/Play';
import { IconSize } from '../Icon';
import { ImageProps, Image } from './Image';

export interface VideoImageProps extends ImageProps {
  size?: IconSize;
  wrapperClassName?: string;
}

const VideoImage = ({
  size = IconSize.XLarge,
  wrapperClassName,
  ...props
}: VideoImageProps): ReactElement => {
  return (
    <div
      className={classNames(
        wrapperClassName,
        'flex relative justify-center items-center h-auto rounded-12 w-full',
      )}
    >
      <span className="absolute w-full h-full rounded-12 bg-overlay-tertiary-black" />
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
