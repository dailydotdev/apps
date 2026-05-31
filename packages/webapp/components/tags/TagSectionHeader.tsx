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
 * Header for the main full-width sections (Best of, All posts). Icon and the
 * title+subtitle text block sit on one baseline so the subtitle aligns under
 * the title copy — not under the icon.
 */
export function TagSectionHeader({
  icon,
  title,
  subtitle,
  action,
  className,
}: TagSectionHeaderProps): ReactElement {
  return (
    <div
      className={classNames(
        'mx-4 flex items-center justify-between gap-3',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        {icon && (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-10 bg-surface-float text-text-primary">
            {icon}
          </span>
        )}
        <div className="flex min-w-0 flex-col">
          <h2 className="truncate font-bold typo-title3">{title}</h2>
          {subtitle && (
            <p className="truncate text-text-tertiary typo-footnote">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}
