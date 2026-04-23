import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';

interface PostContentWidgetProps {
  children: ReactNode;
  title: ReactNode;
  icon?: ReactNode;
  className?: string;
  titleClassName?: string;
}

export function PostContentWidget({
  children,
  className,
  icon,
  title,
  titleClassName,
}: PostContentWidgetProps): ReactElement {
  return (
    <div
      className={classNames(
        'flex flex-col items-center gap-2 rounded-12 border border-border-subtlest-tertiary px-4 py-3 laptop:flex-row laptop:gap-4',
        className,
      )}
    >
      <span
        className={classNames(
          'flex flex-row items-center gap-1 font-bold text-text-tertiary typo-callout',
          titleClassName,
        )}
      >
        {icon}
        {title}
      </span>
      {children}
    </div>
  );
}
