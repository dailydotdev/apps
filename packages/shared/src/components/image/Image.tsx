import React, {
  forwardRef,
  ImgHTMLAttributes,
  ReactElement,
  Ref,
  SyntheticEvent,
} from 'react';

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const ImageComponent = (
  { fallbackSrc, ...props }: ImageProps,
  ref: Ref<HTMLImageElement> = null,
): ReactElement => {
  const onError = (event: SyntheticEvent<HTMLImageElement>): void => {
    if (fallbackSrc && fallbackSrc !== event.currentTarget.src) {
      // eslint-disable-next-line no-param-reassign
      event.currentTarget.src = fallbackSrc;
    }
  };

  // eslint-disable-next-line jsx-a11y/alt-text
  return <img {...props} ref={ref} onError={onError} />;
};

export const Image = forwardRef(ImageComponent);
