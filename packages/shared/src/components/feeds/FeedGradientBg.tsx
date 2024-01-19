import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { useFeedLayout } from '../../hooks';
import { cloudinary } from '../../lib/image';

export type FeedGradientBgProps = {
  className?: string;
};

export function FeedGradientBg({
  className,
}: FeedGradientBgProps): ReactElement {
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
          className,
          'absolute left-0 right-0 top-0 mx-auto w-full laptop:max-w-[58.75rem]',
        )}
        src={cloudinary.feed.bg.mobile}
        alt="Gradient background"
      />
    </picture>
  );
}
