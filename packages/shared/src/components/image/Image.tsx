import React, {
  forwardRef,
  ImgHTMLAttributes,
  ReactElement,
  Ref,
  SyntheticEvent,
  useState,
} from 'react';

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const ImageComponent = (
  { fallbackSrc, ...props }: ImageProps,
  ref: Ref<HTMLImageElement> = null,
): ReactElement => {
  const [retries, setRetries] = useState(0);

  const onError = (event: SyntheticEvent<HTMLImageElement>): void => {
    if (retries >= 3) return;

    if (fallbackSrc) {
      setRetries((value) => value + 1);
      // eslint-disable-next-line no-param-reassign
      event.currentTarget.src = fallbackSrc;
    }
  };

  // eslint-disable-next-line jsx-a11y/alt-text
  return <img {...props} ref={ref} onError={onError} />;
};

export const Image = forwardRef(ImageComponent);
