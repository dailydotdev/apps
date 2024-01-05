import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { useFeedLayout, useViewSize, ViewSize } from '../../hooks';
import { cloudinary } from '../../lib/image';

export function FeedGradientBg(): ReactElement {
  const isMobile = useViewSize(ViewSize.MobileL);
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { shouldUseFeedLayoutV1 } = useFeedLayout();
  const getImage = () => {
    if (isMobile) {
      return cloudinary.feed.bg.mobile;
    }

    return isLaptop || shouldUseFeedLayoutV1
      ? cloudinary.feed.bg.laptop
      : cloudinary.feed.bg.tablet;
  };

  return (
    <img
      className={classNames(
        'absolute left-0 top-0 w-full laptop:max-w-[58.75rem]',
        shouldUseFeedLayoutV1 && 'laptop:left-1/2 laptop:-translate-x-1/2',
      )}
      src={getImage()}
      alt="Gradient background"
    />
  );
}
