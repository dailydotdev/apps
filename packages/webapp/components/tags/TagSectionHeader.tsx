import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';

interface TagSectionHeaderProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Shared section header for the tag page so every block (Best of, People,
 * Learn, All posts) shares the same rhythm and hierarchy. Renders an <h2> so
 * the page keeps a clean heading outline under the single hero <h1>.
 */
export function TagSectionHeader({
  icon,
  title,
  subtitle,
  action,
  className,
}: TagSectionHeaderProps): ReactElement {
  return (
    <div className={classNames('mx-4 flex flex-col gap-1', className)}>
      <div className="flex min-h-8 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 text-text-primary">
          {icon}
          <h2 className="truncate font-bold typo-title3">{title}</h2>
        </div>
        {action}
      </div>
      {subtitle && (
        <p className="text-text-tertiary typo-footnote">{subtitle}</p>
      )}
    </div>
  );
}
