import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';

interface PostContentWidgetProps {
  children: ReactNode;
  title: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function PostContentWidget({
  children,
  className,
  icon,
  title,
}: PostContentWidgetProps): ReactElement {
  return (
    <div
      className={classNames(
        'rounded-12 border-border-subtlest-tertiary laptop:flex-row laptop:gap-4 flex flex-col items-center gap-2 border px-4 py-3',
        className,
      )}
    >
      <span className="text-text-tertiary typo-callout flex flex-row items-center gap-1 font-bold">
        {icon}
        {title}
      </span>
      {children}
    </div>
  );
}
