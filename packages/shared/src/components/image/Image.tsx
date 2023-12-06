import React, {
  forwardRef,
  ImgHTMLAttributes,
  ReactElement,
  Ref,
  SyntheticEvent,
} from 'react';
import VideoPlayOverlay from '../video/VideoPlayOverlay';

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
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
    <div className="flex relative justify-center items-center my-2 w-full h-auto rounded-xl">
      {isVideoType && <VideoPlayOverlay />}
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img {...props} ref={ref} onError={onError} />
    </div>
  );
};

export const Image = forwardRef(ImageComponent);
