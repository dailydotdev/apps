import React, {
  forwardRef,
  ImgHTMLAttributes,
  ReactElement,
  Ref,
  SyntheticEvent,
} from 'react';
import PlayIcon from '../icons/Play';
import { IconSize } from '../Icon';

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
    <div className="flex relative justify-center items-center w-full h-auto rounded-xl">
      {isVideoType && (
        <>
          <span className="absolute w-full h-full bg-overlay-float-pepper" />
          <PlayIcon
            secondary
            size={IconSize.XXXLarge}
            data-testid="playIconVideoPost"
            className="absolute"
          />
        </>
      )}
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img {...props} ref={ref} onError={onError} />
    </div>
  );
};

export const Image = forwardRef(ImageComponent);
