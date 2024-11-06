import React, { ReactElement, SyntheticEvent } from 'react';
import { WithClassNameProps } from '@dailydotdev/shared/src/components/utilities';

interface SiteImageProps extends WithClassNameProps {
  url: string;
  iconSize: number;
}
export const SiteImage = ({
  url,
  iconSize,
  className,
}: SiteImageProps): ReactElement => {
  const cleanUrl = encodeURIComponent(url);
  const src = `https://www.google.com/s2/favicons?sz=${iconSize}&domain=${cleanUrl}`;
  const fallbackSrc = `https://api.daily.dev/icon?url=${cleanUrl}&size=${iconSize}`;
  const onError = (event: SyntheticEvent<HTMLImageElement>): void => {
    if (fallbackSrc && fallbackSrc !== event.currentTarget.src) {
      // eslint-disable-next-line no-param-reassign
      event.currentTarget.src = fallbackSrc;
    }
  };

  return <img src={src} alt={url} className={className} onError={onError} />;
};
