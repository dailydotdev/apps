import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';

/**
 * One card on the page's first row: what it is in a line, one detail, and
 * one button that keeps its size and place on every card. Below laptop the
 * button, and whatever sits beside it, fill the card's width.
 */
export const LeaderboardActionCard = ({
  title,
  detail,
  children,
  action,
  aside,
  className,
  actionClassName,
}: {
  title: ReactNode;
  detail?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  aside?: ReactNode;
  className?: string;
  /** Where the action shows, when a card moves it on some widths. */
  actionClassName?: string;
}): ReactElement => (
  <article
    className={classNames(
      'flex h-full flex-col gap-3 rounded-16 border p-4',
      className ?? 'border-border-subtlest-tertiary',
    )}
  >
    <header className="flex flex-col gap-0.5">
      <div className="font-bold typo-callout">{title}</div>
      {detail && (
        <div className="text-text-tertiary typo-footnote">{detail}</div>
      )}
    </header>
    {children}
    {(aside || action) && (
      <div className="mt-auto flex flex-wrap items-end justify-end gap-2">
        {aside}
        {action && (
          <span
            className={classNames(
              'w-full shrink-0 laptop:w-44 [&_button]:w-full',
              actionClassName ?? 'flex',
            )}
          >
            {action}
          </span>
        )}
      </div>
    )}
  </article>
);
