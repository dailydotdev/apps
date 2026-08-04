import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';

export const FeaturedWideTextContainer = ({
  useGlass,
  children,
}: {
  useGlass?: boolean;
  children: ReactNode;
}): ReactElement => (
  <div
    className={classNames(
      'flex flex-col',
      useGlass ? 'min-h-0 flex-1 overflow-hidden px-4' : 'mx-4',
    )}
  >
    {children}
  </div>
);
