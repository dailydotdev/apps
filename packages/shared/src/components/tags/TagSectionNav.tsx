import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';

export interface TagSectionNavItem {
  href: string;
  label: string;
  isVisible?: boolean;
}

interface TagSectionNavProps {
  items: TagSectionNavItem[];
  className?: string;
}

export const TagSectionNav = ({
  items,
  className,
}: TagSectionNavProps): ReactElement | null => {
  const visibleItems = items.filter((item) => item.isVisible !== false);

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Tag page sections"
      className={classNames(
        'bg-background-default/95 shadow-1 sticky top-0 z-1 mb-6 overflow-hidden rounded-20 border border-border-subtlest-tertiary p-2 backdrop-blur',
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-3 px-2">
        <p className="font-bold text-text-primary typo-caption1">Hub map</p>
        <p className="hidden text-text-quaternary typo-caption1 mobileL:block">
          Pick a path through the topic.
        </p>
      </div>
      <ul className="no-scrollbar flex gap-1 overflow-x-auto rounded-16 bg-surface-primary p-1">
        {visibleItems.map((item) => (
          <li key={item.href} className="shrink-0">
            <a
              href={item.href}
              className="block rounded-12 px-3 py-2 font-bold text-text-tertiary transition-all duration-200 typo-footnote hover:bg-surface-hover hover:text-text-primary"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
