import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';

export const FeaturedWideTextContainer = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}): ReactElement => (
  <div className={classNames('mx-4 flex flex-col', className)}>{children}</div>
);
