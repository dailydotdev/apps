import type { ReactElement, ReactNode, Ref } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';

export const FeaturedWideTextContainer = forwardRef(
  function FeaturedWideTextContainer(
    {
      className,
      children,
    }: {
      className?: string;
      children: ReactNode;
    },
    ref: Ref<HTMLDivElement>,
  ): ReactElement {
    return (
      <div ref={ref} className={classNames('mx-4 flex flex-col', className)}>
        {children}
      </div>
    );
  },
);
