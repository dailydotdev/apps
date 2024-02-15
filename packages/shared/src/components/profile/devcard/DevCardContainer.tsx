import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { DevCardTheme, themeToLinearGradient } from './common';

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
