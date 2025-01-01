import type { ComponentProps, PropsWithChildren, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';

export const pageMainClassNames = 'tablet:p-4 laptop:px-10 laptop:py-5';

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
