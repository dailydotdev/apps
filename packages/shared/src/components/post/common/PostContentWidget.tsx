import React, { ReactElement, ReactNode } from 'react';
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
        'flex flex-col items-center gap-2 rounded-12 border border-border-subtlest-tertiary px-4 py-3 laptop:flex-row laptop:gap-4',
        className,
      )}
    >
      <span className="flex flex-row items-center gap-1 font-bold text-text-tertiary typo-callout">
        {icon}
        {title}
      </span>
      {children}
    </div>
  );
}
