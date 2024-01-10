import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { useFeedLayout } from '../../hooks';
import { cloudinary } from '../../lib/image';

export function FeedGradientBg(): ReactElement {
  const { shouldUseFeedLayoutV1 } = useFeedLayout();

  return (
    <picture>
      <source media="(min-width: 1020px)" srcSet={cloudinary.feed.bg.laptop} />
      <source
        media="(min-width: 656px)"
        srcSet={
          shouldUseFeedLayoutV1
            ? cloudinary.feed.bg.laptop
            : cloudinary.feed.bg.tablet
        }
      />
      <img
        className={classNames(
          'absolute left-0 top-0 w-full laptop:max-w-[58.75rem]',
          shouldUseFeedLayoutV1 && 'laptop:left-1/2 laptop:-translate-x-1/2',
        )}
        src={cloudinary.feed.bg.mobile}
        alt="Gradient background"
      />
    </picture>
  );
}
