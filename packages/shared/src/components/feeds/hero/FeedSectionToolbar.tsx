import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import Link from '../../utilities/Link';
import { Tooltip } from '../../tooltip/Tooltip';
import { Button } from '../../buttons/Button';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { BookmarkIcon, FilterIcon, SearchIcon } from '../../icons';

interface FeedSectionToolbarProps {
  title: string;
  searchHref?: string;
  bookmarksHref?: string;
  onFiltersClick?: () => void;
  className?: string;
}

const iconLinkProps = {
  tag: 'a',
  variant: ButtonVariant.Tertiary,
  size: ButtonSize.Medium,
} as const;

export const FeedSectionToolbar = ({
  title,
  searchHref,
  bookmarksHref,
  onFiltersClick,
  className,
}: FeedSectionToolbarProps): ReactElement => (
  <div className={classNames('flex items-center gap-1', className)}>
    <h2 className="mr-auto font-bold text-text-primary typo-title2">{title}</h2>
    {!!searchHref && (
      <Tooltip content="Search">
        <div>
          <Link href={searchHref} passHref>
            <Button {...iconLinkProps} icon={<SearchIcon />} />
          </Link>
        </div>
      </Tooltip>
    )}
    {!!onFiltersClick && (
      <Tooltip content="Feed filters">
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Medium}
          icon={<FilterIcon />}
          onClick={onFiltersClick}
        />
      </Tooltip>
    )}
    {!!bookmarksHref && (
      <Tooltip content="Bookmarks">
        <div>
          <Link href={bookmarksHref} passHref>
            <Button {...iconLinkProps} icon={<BookmarkIcon />} />
          </Link>
        </div>
      </Tooltip>
    )}
  </div>
);
