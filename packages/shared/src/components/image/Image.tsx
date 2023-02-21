import React, { ImgHTMLAttributes, ReactElement, SyntheticEvent } from 'react';

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export const Image = ({ fallbackSrc, ...props }: ImageProps): ReactElement => {
  const onError = (event: SyntheticEvent<HTMLImageElement>): void => {
    if (fallbackSrc) {
      // eslint-disable-next-line no-param-reassign
      event.currentTarget.src = fallbackSrc;
    }
  };

  return <img {...props} onError={onError} />;
};
