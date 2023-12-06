import React, {
  forwardRef,
  ImgHTMLAttributes,
  ReactElement,
  Ref,
  SyntheticEvent,
} from 'react';
import VideoPlayOverlay from '../video/VideoPlayOverlay';

export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  isVideoType?: boolean;
}

const ImageComponent = (
  { fallbackSrc, isVideoType, ...props }: ImageProps,
  ref?: Ref<HTMLImageElement>,
): ReactElement => {
  const onError = (event: SyntheticEvent<HTMLImageElement>): void => {
    if (fallbackSrc && fallbackSrc !== event.currentTarget.src) {
      // eslint-disable-next-line no-param-reassign
      event.currentTarget.src = fallbackSrc;
    }
  };

  return (
    <>
      {isVideoType && <VideoPlayOverlay />}
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img {...props} ref={ref} onError={onError} />
    </>
  );
};

export const Image = forwardRef(ImageComponent);
