import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { useViewSize, ViewSize } from '../../hooks';
import { cloudinary } from '../../lib/image';

export function FeedGradientBg(): ReactElement {
  const isMobile = useViewSize(ViewSize.MobileL);
  const isLaptop = useViewSize(ViewSize.Laptop);
  const getImage = () => {
    if (isMobile) {
      return cloudinary.feed.bg.mobile;
    }

    return isLaptop ? cloudinary.feed.bg.laptop : cloudinary.feed.bg.tablet;
  };

  return (
    <img
      className={classNames(
        'absolute left-0 top-0 w-full laptop:max-w-[58.75rem]',
      )}
      src={getImage()}
      alt="Gradient background"
    />
  );
}
