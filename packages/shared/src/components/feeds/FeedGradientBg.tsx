import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { cloudinary } from '../../lib/image';

export type FeedGradientBgProps = {
  className?: string;
};

export function FeedGradientBg({
  className,
}: FeedGradientBgProps): ReactElement {
  return (
    <img
      className={classNames(
        className,
        'absolute left-0 right-0 top-0 mx-auto w-full laptop:max-w-[58.75rem]',
      )}
      src={cloudinary.search.gradient.common}
      alt="Gradient background"
    />
  );
}
