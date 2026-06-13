import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { SidebarExpandButton } from '../sidebar/SidebarExpandButton';

// `min-h-14` locks the strip to a Small-button + py-3 height so the
// header reads at a consistent 56px regardless of action contents.
export const pageHeaderClassName =
  'flex min-h-14 w-full items-center gap-2 border-b border-border-subtlest-quaternary px-6 py-3';

export interface PageHeaderProps {
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export const PageHeader = ({
  title,
  children,
  className,
}: PageHeaderProps): ReactElement => (
  <header className={classNames(pageHeaderClassName, className)}>
    <SidebarExpandButton />
    {title !== undefined &&
      (typeof title === 'string' ? (
        <strong className="min-w-0 flex-1 truncate typo-callout">
          {title}
        </strong>
      ) : (
        <div className="flex min-w-0 flex-1 items-center self-stretch">
          {title}
        </div>
      ))}
    {children !== undefined && (
      <div className="-mr-1 ml-auto flex shrink-0 items-center gap-1">
        {children}
      </div>
    )}
  </header>
);
