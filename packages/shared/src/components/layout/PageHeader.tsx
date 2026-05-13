import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';

// Visual shell of the page-header strip. Exported so callers that
// need a custom internal layout (e.g. wide horizontal tabs that
// shouldn't be locked inside the title/actions slot) can compose
// their own `<header>` without duplicating the styling.
//
// `min-h-14` (56px = a Small button + py-3 on each side) locks the
// strip to a consistent height across pages so a header with action
// buttons (Profile's Save, API's Create token, ...) is the same
// height as a header that only renders a title (Content sources,
// Tags, ...). Without this, navigating between settings pages
// caused a 12px vertical shift of the page content below.
export const pageHeaderClassName =
  'flex min-h-14 w-full items-center gap-2 border-b border-border-subtlest-quaternary px-6 py-3';

export interface PageHeaderProps {
  /**
   * Left-side title. A plain string is wrapped in a bold callout
   * (matching the homepage feed header). For custom typography pass
   * a ReactNode and it will render inside a truncating flex slot.
   */
  title?: ReactNode;
  /**
   * Right-side actions (buttons, dropdowns, etc.). Docked to the
   * end of the row with shrink-0 so the title takes the remaining
   * space and truncates first.
   */
  children?: ReactNode;
  className?: string;
}

/**
 * Shared "page header" strip used at the top of the floating card on
 * every primary page (home, squads, bookmarks, game center, ...).
 * Matches the homepage feed list-frame: bottom border, px-6 py-3,
 * title on the left, action buttons docked right.
 */
export const PageHeader = ({
  title,
  children,
  className,
}: PageHeaderProps): ReactElement => (
  <header className={classNames(pageHeaderClassName, className)}>
    {title !== undefined &&
      (typeof title === 'string' ? (
        <strong className="min-w-0 flex-1 truncate typo-callout">
          {title}
        </strong>
      ) : (
        <div className="min-w-0 flex-1 truncate">{title}</div>
      ))}
    {children !== undefined && (
      <div className="-mr-1 ml-auto flex shrink-0 items-center gap-1">
        {children}
      </div>
    )}
  </header>
);
