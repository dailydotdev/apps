import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { DevCardTheme } from './common';
import { themeToLinearGradient } from './common';

interface DevCardContainerProps {
  theme: DevCardTheme;
  className?: string;
  children?: ReactNode;
}

export function DevCardContainer({
  theme,
  className,
  children,
}: DevCardContainerProps): ReactElement {
  const bg = themeToLinearGradient[theme] ?? themeToLinearGradient.default;

  return (
    <div
      className={classNames('flex h-fit rounded-[32px] p-2', className)}
      style={{ background: bg }}
    >
      {children}
    </div>
  );
}
