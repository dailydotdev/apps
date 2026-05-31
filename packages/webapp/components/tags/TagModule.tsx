import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';

interface TagModuleProps {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  /** Removes the inner body padding (for edge-to-edge lists). */
  flushBody?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * A self-contained "hub" card. Every context block on the tag page (About,
 * sources, contributors, related, FAQ, learn) is one of these so the page reads
 * as a set of clearly-bounded modules — a clean, scannable topic hub rather
 * than a long scroll of ambiguous sections.
 */
export function TagModule({
  title,
  icon,
  action,
  flushBody = false,
  className,
  children,
}: TagModuleProps): ReactElement {
  return (
    <section
      className={classNames(
        'flex flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float',
        className,
      )}
    >
      <header className="flex items-center justify-between gap-3 border-b border-border-subtlest-tertiary px-4 py-3">
        <div className="flex min-w-0 items-center gap-2 text-text-primary">
          {icon}
          <h2 className="truncate font-bold typo-callout">{title}</h2>
        </div>
        {action}
      </header>
      <div className={classNames('flex flex-1 flex-col', !flushBody && 'p-4')}>
        {children}
      </div>
    </section>
  );
}
