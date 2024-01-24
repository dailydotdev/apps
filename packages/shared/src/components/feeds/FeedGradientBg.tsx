import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { useFeedLayout } from '../../hooks';

const centered = 'left-1/2 -translate-x-1/2';

export function FeedGradientBg(): ReactElement {
  const { shouldUseFeedLayoutV1 } = useFeedLayout();

  return (
    <div
      className={classNames(
        'absolute -top-24 flex flex-row-reverse justify-center',
        shouldUseFeedLayoutV1
          ? centered
          : classNames(centered, 'laptop:left-0 laptop:translate-x-0'),
      )}
    >
      <span className="h-40 w-70 -translate-x-6 rounded-[50%] bg-theme-color-onion blur-[5rem]" />
      <span className="size-40 translate-x-6 rounded-full bg-theme-color-cabbage blur-[5rem]" />
    </div>
  );
}
