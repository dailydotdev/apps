import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import Link from '../utilities/Link';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { PlusIcon, VIcon } from '../icons';
import { Tooltip } from '../tooltip/Tooltip';
import { getTagPageLink } from '../../lib/links';
import { formatKeyword } from '../../lib/strings';
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
}

// A directory row: the tag link plus a follow control on the right. Followed
// tags keep a persistent check (so you can tell what you already follow);
// unfollowed tags reveal a subtle "+" on hover/focus.
export function TagDirectoryListItem({
  tag,
  title,
  isFollowed,
  onToggleFollow,
}: TagDirectoryListItemProps): ReactElement {
  return (
    <li className="group flex break-inside-avoid items-center gap-1 rounded-10 pr-1 transition-colors hover:bg-surface-hover">
      <Link href={getTagPageLink(tag)} passHref prefetch={false}>
        <Typography
          tag={TypographyTag.Link}
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          className="block min-w-0 flex-1 cursor-pointer truncate px-2 py-1 no-underline transition-colors hover:text-text-primary"
        >
          {title || formatKeyword(tag)}
        </Typography>
      </Link>
      <Tooltip content={isFollowed ? `Following #${tag}` : `Follow #${tag}`}>
        <Button
          type="button"
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Tertiary}
          icon={isFollowed ? <VIcon aria-hidden /> : <PlusIcon aria-hidden />}
          aria-label={isFollowed ? `Unfollow ${tag}` : `Follow ${tag}`}
          aria-pressed={isFollowed}
          onClick={() => onToggleFollow(tag)}
          className={classNames(
            'shrink-0',
            isFollowed
              ? 'text-brand-default'
              : 'opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100',
          )}
        />
      </Tooltip>
    </li>
  );
}
