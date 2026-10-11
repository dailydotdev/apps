import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import Link from '../utilities/Link';
import { PlusIcon, VIcon } from '../icons';
import { IconSize } from '../Icon';
import { Tooltip } from '../tooltip/Tooltip';
import { getTagPageLink } from '../../lib/links';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';

interface TagDirectoryListItemProps {
  tag: string;
  title?: string;
  isFollowed: boolean;
  onToggleFollow: (tag: string) => void;
  onClick?: () => void;
  selectable?: boolean;
}

// The follow control. On a phone it is a 28px rounded square whose shape and
// fill both change (a ring with a plus, then filled brand with a check) and
// whose hit area reaches 44px; from tablet up it stays the quiet icon it was,
// a brand check once followed.
const followControlClassName = (isFollowed: boolean): string =>
  classNames(
    'relative flex size-7 shrink-0 items-center justify-center rounded-10 border transition-colors before:absolute before:-inset-2 before:content-[""]',
    'tablet:size-6 tablet:rounded-8 tablet:border-transparent tablet:bg-transparent tablet:before:inset-0 tablet:hover:bg-surface-hover',
    isFollowed
      ? 'border-transparent bg-brand-default text-white tablet:text-brand-default'
      : 'border-border-subtlest-tertiary text-text-tertiary',
  );

const FollowGlyph = ({ isFollowed }: { isFollowed: boolean }): ReactElement =>
  isFollowed ? (
    <VIcon aria-hidden size={IconSize.XSmall} />
  ) : (
    <PlusIcon aria-hidden size={IconSize.XSmall} />
  );

// A directory row: the tag link plus the follow control on the right. On a
// phone the row is 48px, the two targets sit 12px apart and both answer the
// finger; with a pointer the row is compact and an unfollowed row reveals
// its control on hover or focus.
export function TagDirectoryListItem({
  tag,
  title,
  isFollowed,
  onToggleFollow,
  onClick,
  selectable = false,
}: TagDirectoryListItemProps): ReactElement {
  if (selectable) {
    return (
      <li className="break-inside-avoid">
        <button
          type="button"
          aria-label={isFollowed ? `Unfollow ${tag}` : `Follow ${tag}`}
          aria-pressed={isFollowed}
          onClick={() => onToggleFollow(tag)}
          className={classNames(
            'flex min-h-12 w-full items-center gap-3 rounded-10 px-2 py-1.5 text-left transition-colors typo-callout hover:bg-surface-hover hover:text-text-primary tablet:min-h-0 tablet:gap-2',
            isFollowed ? 'text-text-primary' : 'text-text-secondary',
          )}
        >
          <span className="min-w-0 flex-1 truncate">{title || tag}</span>
          <span className={followControlClassName(isFollowed)}>
            <FollowGlyph isFollowed={isFollowed} />
          </span>
        </button>
      </li>
    );
  }

  return (
    <li className="group flex min-h-12 break-inside-avoid items-center gap-3 rounded-10 pr-2 transition-colors hover:bg-surface-hover tablet:min-h-0 tablet:gap-1 tablet:pr-1">
      <Link href={getTagPageLink(tag)} passHref prefetch={false}>
        <Typography
          tag={TypographyTag.Link}
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          onClick={onClick}
          className="flex min-w-0 flex-1 cursor-pointer items-center self-stretch truncate px-2 py-1 no-underline transition-colors hover:text-text-primary"
        >
          {title || tag}
        </Typography>
      </Link>
      <Tooltip content={isFollowed ? `Following #${tag}` : `Follow #${tag}`}>
        <button
          type="button"
          aria-label={isFollowed ? `Unfollow ${tag}` : `Follow ${tag}`}
          aria-pressed={isFollowed}
          onClick={() => onToggleFollow(tag)}
          className={classNames(
            followControlClassName(isFollowed),
            !isFollowed &&
              'opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100 phone:opacity-100',
          )}
        >
          <FollowGlyph isFollowed={isFollowed} />
        </button>
      </Tooltip>
    </li>
  );
}
