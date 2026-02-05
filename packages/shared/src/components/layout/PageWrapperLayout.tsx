import type { ComponentProps, PropsWithChildren, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';

export const pageMainClassNames = 'tablet:p-4 laptop:p-10';

export const PageWrapperLayout = ({
  children,
  className,
  ...attrs
}: PropsWithChildren & ComponentProps<'main'>): ReactElement => {
  return (
    <main {...attrs} className={classNames(pageMainClassNames, className)}>
      {children}
    </main>
  );
};
