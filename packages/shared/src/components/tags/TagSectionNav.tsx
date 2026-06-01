import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { ButtonProps } from '../buttons/Button';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { PlusIcon } from '../icons';
import type { TagStatus } from './TagPageHero';

export interface TagSectionNavItem {
  href: string;
  label: string;
  isVisible?: boolean;
}

interface TagSectionNavProps {
  items: TagSectionNavItem[];
  tag: string;
  tagStatus: TagStatus;
  followButtonProps: ButtonProps<'button'>;
  className?: string;
}

export const TagSectionNav = ({
  items,
  tag,
  tagStatus,
  followButtonProps,
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
        'sticky top-0 z-3 flex items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-default p-1.5',
        className,
      )}
    >
      <span className="ml-2 hidden shrink-0 font-bold text-text-primary typo-callout tablet:block">
        <span className="text-accent-cabbage-default">#</span>
        {tag}
      </span>
      <ul className="no-scrollbar flex flex-1 gap-1 overflow-x-auto">
        {visibleItems.map((item) => (
          <li key={item.href} className="shrink-0">
            <a
              href={item.href}
              className="block rounded-10 px-3 py-1.5 font-bold text-text-tertiary transition-colors duration-200 typo-footnote hover:bg-surface-hover hover:text-text-primary"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      {tagStatus !== 'blocked' && (
        <Button
          type="button"
          variant={
            tagStatus === 'followed'
              ? ButtonVariant.Subtle
              : ButtonVariant.Primary
          }
          size={ButtonSize.Small}
          icon={<PlusIcon />}
          {...followButtonProps}
          aria-label={
            tagStatus === 'followed' ? `Unfollow #${tag}` : `Follow #${tag}`
          }
          className={classNames(
            'hidden shrink-0 tablet:flex',
            followButtonProps.className,
          )}
        >
          {tagStatus === 'followed' ? 'Following' : 'Follow'}
        </Button>
      )}
    </nav>
  );
};
