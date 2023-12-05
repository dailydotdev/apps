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
  title?: string;
}

const ImageComponent = (
  { fallbackSrc, isVideoType, title, ...props }: ImageProps,
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
      {isVideoType && (
        <div className="flex absolute flex-col justify-center my-2 w-full h-40 rounded-xl bg-overlay-float-pepper">
          <PlayIcon secondary className="mx-auto" size={IconSize.XXXLarge} />
        </div>
      )}
      <img {...props} ref={ref} onError={onError} alt={title} />
    </>
  );
};

export const Image = forwardRef(ImageComponent);
