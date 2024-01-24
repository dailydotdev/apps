import React, { ReactElement } from 'react';
import { useFeedLayout } from '../../hooks';
import { cloudinary } from '../../lib/image';

export function FeedGradientBg(): ReactElement {
  const { shouldUseFeedLayoutV1 } = useFeedLayout();

  if (shouldUseFeedLayoutV1) {
    return (
      <div className="absolute -top-24 left-1/2 flex -translate-x-1/2 flex-row-reverse justify-center">
        <span className="h-40 w-70 -translate-x-6 rounded-[50%] bg-theme-color-onion blur-[5rem]" />
        <span className="size-40 translate-x-6 rounded-full bg-theme-color-cabbage blur-[5rem]" />
      </div>
    );
  }

  return (
    <picture>
      <source media="(min-width: 1020px)" srcSet={cloudinary.feed.bg.laptop} />
      <source media="(min-width: 656px)" srcSet={cloudinary.feed.bg.tablet} />
      <img
        className="absolute left-0 top-0 w-full laptop:max-w-[58.75rem]"
        src={cloudinary.feed.bg.mobile}
        alt="Gradient background"
      />
    </picture>
  );
}
