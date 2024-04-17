import React, { ReactElement } from 'react';
import classNames from 'classnames';

const centered = 'left-1/2 -translate-x-1/2';

export type FeedGradientBgProps = {
  className?: string;
};

export function FeedGradientBg({
  className,
}: FeedGradientBgProps): ReactElement {
  return (
    <div
      className={classNames(
        className,
        'absolute -top-40 flex max-w-full flex-row-reverse justify-center',
        centered,
      )}
    >
      <span className="h-40 w-60 -translate-x-6 rounded-[50%] bg-accent-onion-default blur-[5rem] laptop:w-70" />
      <span className="size-40 translate-x-6 rounded-full bg-accent-cabbage-default blur-[5rem]" />
    </div>
  );
}
