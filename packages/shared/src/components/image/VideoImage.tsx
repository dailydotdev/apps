import React, { ReactElement } from 'react';
import PlayIcon from '../icons/Play';
import { IconSize } from '../Icon';
import { ImageProps, Image } from './Image';

export interface VideoImageProps extends ImageProps {
  size?: IconSize;
}

const VideoImage = ({
  size = IconSize.XXXLarge,
  ...props
}: VideoImageProps): ReactElement => {
  return (
    <div className="flex relative justify-center items-center my-2 w-full h-auto rounded-xl">
      <>
        <span className="absolute w-full h-full rounded-xl bg-overlay-tertiary-black" />
        <PlayIcon
          secondary
          size={size}
          data-testid="playIconVideoPost"
          className="absolute"
        />
      </>
      <Image {...props} />
    </div>
  );
};

export default VideoImage;
