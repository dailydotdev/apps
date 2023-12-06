import React, { ReactElement } from 'react';
import PlayIcon from '../icons/Play';
import { IconSize } from '../Icon';

interface VideoPlayOverlayProps {
  size?: IconSize;
}

const VideoPlayOverlay = ({
  size = IconSize.XXXLarge,
}: VideoPlayOverlayProps): ReactElement => (
  <>
    <span className="absolute w-full h-full bg-overlay-float-pepper" />
    <PlayIcon
      secondary
      size={size}
      data-testid="playIconVideoPost"
      className="absolute"
    />
  </>
);

export default VideoPlayOverlay;
