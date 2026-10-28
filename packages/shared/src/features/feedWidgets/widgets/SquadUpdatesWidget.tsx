import type { CSSProperties, ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { usePostLogEvent } from '../../../lib/feed';
import { LogEvent, Origin } from '../../../lib/log';
import type { Post } from '../../../graphql/posts';
import type { Squad } from '../../../graphql/sources';
import {
  squadCoverQueryOptions,
  squadLatestPostsQueryOptions,
} from '../../../graphql/squads';
import { SquadImage } from '../../../components/squads/SquadImage';
import { RelativeTime } from '../../../components/utilities/RelativeTime';
import { LazyImage } from '../../../components/LazyImage';
import { Button } from '../../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import { VIcon } from '../../../components/icons/V';
import Link from '../../../components/utilities/Link';
import type { FeedWidgetComponentProps } from '../registry';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import { FeedWidgetEmpty } from '../FeedWidgetFrame';
import { useWidgetScroll } from '../useWidgetScroll';

// Where the squad has no cover of its own: its tone, low, like a blank banner.
const blankCoverStyle: CSSProperties = {
  backgroundImage:
    'linear-gradient(135deg, color-mix(in srgb, var(--theme-accent-avocado-default) 32%, transparent), color-mix(in srgb, var(--theme-accent-water-default) 16%, transparent))',
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
  onClick,
}: {
  post: Post;
  onClick: (post: Post) => void;
}): ReactElement => {
  const title = post.title || post.sharedPost?.title;
  const image = post.image || post.sharedPost?.image;

  return (
    <li className="snap-start">
      <Link href={post.commentsPermalink}>
        <a
          href={post.commentsPermalink}
          title={title}
          onClick={() => onClick(post)}
          className="flex items-start gap-2.5 rounded-12 px-2 py-1.5 transition-colors duration-150 hover:bg-surface-hover focus-visible:bg-surface-hover motion-reduce:transition-none"
        >
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="line-clamp-2 break-words font-bold text-text-primary typo-footnote">
              {title}
            </span>
            <span className="truncate text-text-tertiary typo-caption1">
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
          </span>
          {!!image && (
            <LazyImage
              imgSrc={image}
              imgAlt=""
              className="size-12 shrink-0 rounded-10"
            />
          )}
        </a>
      </Link>
    </li>
  );
};

const PostList = ({
  posts,
  isWide,
  onClick,
}: {
  posts: Post[];
  isWide: boolean;
  onClick: (post: Post) => void;
}): ReactElement => (
  <ul
    aria-label="Squad posts"
    className={classNames(
      'gap-1',
      isWide ? 'grid grid-cols-2 gap-x-4' : 'flex flex-col',
    )}
  >
    {posts.map((post) => (
      <PostRow key={post.id} post={post} onClick={onClick} />
    ))}
  </ul>
);

/** The newest posts in one squad the reader picked from theirs. */
export const SquadUpdatesWidget = ({
  widget,
  size,
  onConfigChange,
  canConfigure,
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
  const isSmall = size === FeedWidgetSize.Small;
  const { data: cover } = useQuery({
    ...squadCoverQueryOptions({ sourceId: squad?.id }),
    enabled: !!squad && !isConfiguring && !isSmall,
  });
  const scroll = useWidgetScroll();

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

  if ((!squad || isConfiguring) && !canConfigure) {
    return (
      <FeedWidgetEmpty
        kind={FeedWidgetKind.SquadUpdates}
        message="This widget was set up in a newer version of daily.dev."
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

  const openSquad = (
    <Link href={squad.permalink} passHref>
      <Button
        tag="a"
        href={squad.permalink}
        aria-label={`Open ${squad.name}`}
        variant={ButtonVariant.Primary}
        size={ButtonSize.XSmall}
      >
        Open squad
      </Button>
    </Link>
  );
  const list = posts.length ? (
    <PostList
      posts={posts}
      isWide={size === FeedWidgetSize.Large}
      onClick={onPostClick}
    />
  ) : (
    <FeedWidgetEmpty
      kind={FeedWidgetKind.SquadUpdates}
      isPending={isPending}
      message="No posts in this squad yet."
    />
  );

  if (isSmall) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-6 min-w-0 shrink-0 items-center gap-1.5 px-4">
          <SquadImage className="size-5 shrink-0" {...squad} />
          <span className="truncate font-bold text-text-primary typo-caption1">
            {squad.name}
          </span>
          <span className="ml-auto shrink-0">{openSquad}</span>
        </header>
        <div
          ref={scroll.ref}
          onScroll={scroll.onScroll}
          style={scroll.style}
          className={classNames('mt-2 flex flex-col px-2', scroll.className)}
        >
          {list}
        </div>
      </div>
    );
  }

  // The squad's cover leads, and the whole card scrolls as one page, cover
  // and name included; only "Open squad" stays pinned.
  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
      <div
        ref={scroll.ref}
        onScroll={scroll.onScroll}
        style={scroll.style}
        className={classNames('-mt-3 flex flex-col', scroll.className)}
      >
        <div
          className={classNames(
            'relative shrink-0',
            size === FeedWidgetSize.Large ? 'h-28' : 'h-24',
          )}
          style={cover?.headerImage ? undefined : blankCoverStyle}
        >
          {!!cover?.headerImage && (
            <LazyImage
              imgSrc={cover.headerImage}
              imgAlt=""
              className="size-full"
            />
          )}
          <SquadImage
            className="absolute -bottom-7 left-4 size-14 border-4 border-background-subtle"
            {...squad}
          />
        </div>
        <Link href={squad.permalink}>
          <a
            href={squad.permalink}
            className="ml-[4.75rem] mt-1.5 block truncate pr-4 font-bold text-text-primary typo-callout hover:underline"
          >
            {squad.name}
          </a>
        </Link>
        <div className="mt-5 flex flex-col px-2">{list}</div>
      </div>
      <span className="absolute right-3 top-0 z-1">{openSquad}</span>
    </div>
  );
};
