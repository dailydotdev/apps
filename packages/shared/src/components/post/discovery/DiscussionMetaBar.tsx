import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useUpvoteQuery } from '../../../hooks/useUpvoteQuery';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { TimeSortIcon } from '../../icons/Sort/Time';
import { AnalyticsIcon } from '../../icons';
import { SortCommentsBy } from '../../../graphql/comments';
import { ClickableText } from '../../buttons/ClickableText';
import Link from '../../utilities/Link';
import { largeNumberFormat } from '../../../lib';
import { canViewPostAnalytics } from '../../../lib/user';
import { webappUrl } from '../../../lib/constants';

interface DiscussionMetaBarProps {
  post: Post;
  className?: string;
  /** Optional content rendered on the right edge of the strip (e.g. clickbait shield). */
  rightSlot?: ReactNode;
}

/**
 * Post stats + comment sort strip. Lives in the left content column above the
 * action bar; the sort toggle updates the shared settings context, so the
 * discussion panel re-sorts its comments accordingly.
 */
export const DiscussionMetaBar = ({
  post,
  className,
  rightSlot,
}: DiscussionMetaBarProps): ReactElement => {
  const { user } = useAuthContext();
  const { onShowUpvoted } = useUpvoteQuery();
  const { sortCommentsBy: sortBy, updateSortCommentsBy: setSortBy } =
    useSettingsContext();
  const upvotes = post.numUpvotes || 0;
  const comments = post.numComments || 0;
  const canSeeAnalytics = canViewPostAnalytics({ user, post });
  const isNewestFirst = sortBy === SortCommentsBy.NewestFirst;
  const sortLabel = isNewestFirst ? 'Sort: Newest first' : 'Sort: Oldest first';

  return (
    <div
      className={classNames(
        'flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 text-text-secondary typo-callout',
        className,
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-x-4">
        {upvotes > 0 && (
          <ClickableText onClick={() => onShowUpvoted(post.id, upvotes)}>
            {largeNumberFormat(upvotes)} Upvote{upvotes > 1 ? 's' : ''}
          </ClickableText>
        )}
        <span>
          {largeNumberFormat(comments)} Comment{comments === 1 ? '' : 's'}
        </span>
        {canSeeAnalytics && (
          <Link
            href={`${webappUrl}posts/${post.id}/analytics`}
            passHref
            prefetch={false}
          >
            <ClickableText
              tag="a"
              className="gap-1"
              textClassName="text-text-secondary"
            >
              <AnalyticsIcon />
              Analytics
            </ClickableText>
          </Link>
        )}
        <Button
          type="button"
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Tertiary}
          icon={
            <TimeSortIcon
              secondary
              className={isNewestFirst ? undefined : 'rotate-180'}
            />
          }
          onClick={() =>
            setSortBy(
              isNewestFirst
                ? SortCommentsBy.OldestFirst
                : SortCommentsBy.NewestFirst,
            )
          }
          aria-label={sortLabel}
          title={sortLabel}
          className="!text-text-secondary"
        />
      </div>
      {rightSlot && (
        <div className="flex shrink-0 items-center [&_.mr-2]:!mr-0 [&_.mt-4]:!mt-0 [&_.mt-6]:!mt-0">
          {rightSlot}
        </div>
      )}
    </div>
  );
};
