import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { usePostLogEvent } from '../../../lib/feed';
import { LogEvent, Origin } from '../../../lib/log';
import type { Post } from '../../../graphql/posts';
import type { Squad } from '../../../graphql/sources';
import { squadLatestPostsQueryOptions } from '../../../graphql/squads';
import { SquadImage } from '../../../components/squads/SquadImage';
import { RelativeTime } from '../../../components/utilities/RelativeTime';
import { Button } from '../../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import { VIcon } from '../../../components/icons/V';
import Link from '../../../components/utilities/Link';
import type { FeedWidgetComponentProps } from '../registry';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import { FeedWidgetEmpty } from '../FeedWidgetFrame';

/** As many rows as the cell shows whole. */
const postsPerSize: Record<FeedWidgetSize, number> = {
  [FeedWidgetSize.Small]: 2,
  [FeedWidgetSize.Tall]: 4,
  [FeedWidgetSize.Large]: 8,
};

const SquadPicker = ({
  squads,
  selectedId,
  message,
  onPick,
  onCancel,
}: {
  squads: Squad[];
  selectedId?: string;
  message: string;
  onPick: (squad: Squad) => void;
  onCancel?: () => void;
}): ReactElement => (
  <div className="flex min-h-0 flex-1 flex-col">
    <p className="px-4 pb-2 text-text-tertiary typo-footnote">{message}</p>
    <ul
      aria-label="Your squads"
      className="flex min-h-0 flex-1 flex-col overflow-y-auto px-2"
    >
      {squads.map((squad) => {
        const isSelected = squad.id === selectedId;

        return (
          <li key={squad.id}>
            <button
              type="button"
              aria-pressed={isSelected}
              onClick={() => onPick(squad)}
              className="flex w-full items-center gap-2 rounded-12 p-2 text-left text-text-primary transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover"
            >
              <SquadImage className="size-6 shrink-0" {...squad} />
              <span className="min-w-0 flex-1 truncate typo-callout">
                {squad.name}
              </span>
              {isSelected && <VIcon className="text-text-tertiary" />}
            </button>
          </li>
        );
      })}
    </ul>
    {!!onCancel && (
      <div className="px-4 pt-2">
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.XSmall}
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    )}
  </div>
);

const PostRow = ({
  post,
  isSmall,
  onClick,
}: {
  post: Post;
  isSmall: boolean;
  onClick: (post: Post) => void;
}): ReactElement => (
  <Link href={post.commentsPermalink}>
    <a
      href={post.commentsPermalink}
      onClick={() => onClick(post)}
      // Drawn, not bordered, like the Happening Now rows: a `border-b`
      // follows the row's corner radius and curves up at both ends.
      className="relative flex min-w-0 flex-col rounded-12 px-4 py-3 transition-colors after:absolute after:inset-x-4 after:bottom-0 after:h-px after:bg-border-subtlest-tertiary last:after:hidden hover:bg-surface-hover focus-visible:bg-surface-hover"
    >
      <span
        className={classNames(
          'break-words font-bold text-text-primary typo-callout',
          isSmall ? 'line-clamp-1' : 'line-clamp-2',
        )}
      >
        {post.title || post.sharedPost?.title}
      </span>
      <span className="truncate text-text-tertiary typo-footnote">
        {!!post.author?.name && (
          <>
            {post.author.name}
            <span aria-hidden> · </span>
          </>
        )}
        {!!post.createdAt && (
          <RelativeTime dateTime={post.createdAt} maxHoursAgo={72} />
        )}
      </span>
    </a>
  </Link>
);

/** The newest posts in one squad the reader picked from theirs. */
export const SquadUpdatesWidget = ({
  widget,
  size,
  onConfigChange,
  isConfiguring,
  onConfigureEnd,
}: FeedWidgetComponentProps<FeedWidgetKind.SquadUpdates>): ReactElement => {
  const { user, squads } = useAuthContext();
  const { logEvent } = useLogContext();
  const postLogEvent = usePostLogEvent();
  const sourceId = widget.config?.sourceId;
  const squad = squads?.find(({ id }) => id === sourceId);
  const { data: posts = [], isPending } = useQuery({
    ...squadLatestPostsQueryOptions({ sourceId: squad?.id, user }),
    enabled: !!squad && !isConfiguring,
  });

  const onPostClick = useCallback(
    (post: Post) =>
      logEvent(
        postLogEvent(LogEvent.Click, post, {
          extra: { origin: Origin.FeedWidgets },
        }),
      ),
    [logEvent, postLogEvent],
  );

  if (!squads?.length) {
    return (
      <FeedWidgetEmpty
        kind={FeedWidgetKind.SquadUpdates}
        message="Join a squad to see its posts here."
      />
    );
  }

  if (!squad || isConfiguring) {
    const onPick = ({ id }: Squad) => {
      if (onConfigChange({ sourceId: id })) {
        onConfigureEnd();
      }
    };
    let message = 'Pick a squad to see its newest posts here.';
    if (squad) {
      message = 'Pick the squad this widget shows.';
    } else if (sourceId) {
      message = 'You’re no longer in that squad. Pick another one.';
    }

    return (
      <SquadPicker
        squads={squads}
        selectedId={squad?.id}
        message={message}
        onPick={onPick}
        onCancel={squad ? onConfigureEnd : undefined}
      />
    );
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <Link href={squad.permalink}>
        <a
          href={squad.permalink}
          className="flex min-w-0 items-center gap-2 px-4 pb-1 text-text-primary hover:underline"
        >
          <SquadImage className="size-6 shrink-0" {...squad} />
          <span className="truncate font-bold typo-callout">{squad.name}</span>
        </a>
      </Link>
      {posts.length ? (
        <div
          className={classNames(
            'min-h-0 flex-1 overflow-hidden',
            size === FeedWidgetSize.Large
              ? 'grid grid-cols-2 content-start'
              : 'flex flex-col',
          )}
        >
          {posts.slice(0, postsPerSize[size]).map((post) => (
            <PostRow
              key={post.id}
              post={post}
              isSmall={size === FeedWidgetSize.Small}
              onClick={onPostClick}
            />
          ))}
        </div>
      ) : (
        <FeedWidgetEmpty
          kind={FeedWidgetKind.SquadUpdates}
          isPending={isPending}
          message="No posts in this squad yet."
        />
      )}
    </div>
  );
};
