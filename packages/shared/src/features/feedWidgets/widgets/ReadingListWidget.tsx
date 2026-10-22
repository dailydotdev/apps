import type { CSSProperties, ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { usePostLogEvent } from '../../../lib/feed';
import { LogEvent, Origin } from '../../../lib/log';
import { getPostPath } from '../../../lib/links';
import { webappUrl } from '../../../lib/constants';
import type { Post } from '../../../graphql/posts';
import { latestBookmarksQueryOptions } from '../../../graphql/bookmarks';
import { useCachedTokenRecovery } from '../../../hooks/useCachedTokenRecovery';
import { LazyImage } from '../../../components/LazyImage';
import { formatReadTime } from '../../../components/utilities/common';
import Link from '../../../components/utilities/Link';
import { Button } from '../../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import { IconSize } from '../../../components/Icon';
import { BookmarkIcon } from '../../../components/icons/Bookmark';
import { combinedClicks } from '../../../lib/click';
import type { FeedWidgetComponentProps } from '../registry';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import { FeedWidgetEmpty } from '../FeedWidgetFrame';
import { useWidgetScroll } from '../useWidgetScroll';

// The list scrolls, so one fetch covers every size and resizing never refetches.
const READING_LIST_FIRST = 12;

const bookmarksHref = `${webappUrl}bookmarks`;

// The widget's own material, a warm library wash, kept low so the list leads.
const libraryStyle: CSSProperties = {
  backgroundImage:
    'linear-gradient(to top, color-mix(in srgb, var(--theme-accent-bun-default) 20%, transparent) 0%, transparent 55%), radial-gradient(80% 50% at 100% 0%, color-mix(in srgb, var(--theme-accent-bun-default) 12%, transparent) 0%, transparent 70%)',
};

const ReadingListRow = ({
  post,
  onClick,
}: {
  post: Post;
  onClick: () => void;
}): ReactElement => {
  const title = post.title ?? post.sharedPost?.title;
  const readTime = post.readTime ?? post.sharedPost?.readTime;
  const image = post.image ?? post.sharedPost?.image;
  const href = getPostPath(post);

  return (
    <li className="snap-start">
      <Link href={href} passHref prefetch={false}>
        <a
          href={href}
          title={title}
          className="flex items-start gap-2.5 rounded-12 px-2 py-1.5 transition-colors duration-150 hover:bg-surface-hover motion-reduce:transition-none"
          {...combinedClicks(onClick)}
        >
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="line-clamp-2 break-words font-bold text-text-primary typo-footnote">
              {title}
            </span>
            <span className="truncate text-text-tertiary typo-caption1">
              {post.source?.name}
              {!!readTime && ` · ${formatReadTime(readTime)} read`}
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

/** The reader's latest bookmarks, newest first like the bookmarks page. */
export const ReadingListWidget = ({
  size,
}: FeedWidgetComponentProps<FeedWidgetKind.ReadingList>): ReactElement => {
  const { user, isTokenValid } = useAuthContext();
  const { logEvent } = useLogContext();
  const postLogEvent = usePostLogEvent();
  const scroll = useWidgetScroll();
  const queryOptions = latestBookmarksQueryOptions({
    user,
    first: READING_LIST_FIRST,
  });
  const isEnabled = !!user && isTokenValid;
  const { data, isPending } = useQuery({
    ...queryOptions,
    enabled: isEnabled,
  });
  useCachedTokenRecovery({
    queryKey: queryOptions.queryKey,
    enabled: isEnabled,
  });

  const logClick = useCallback(
    (post: Post, index: number) =>
      logEvent(
        postLogEvent(LogEvent.Click, post, {
          index,
          extra: { origin: Origin.FeedWidgets },
        }),
      ),
    [logEvent, postLogEvent],
  );

  const posts = (data?.page.edges ?? []).map(({ node }) => node);

  return (
    <div
      className="relative isolate flex min-h-0 min-w-0 flex-1 flex-col"
      data-size={size}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-4 -z-1"
        style={libraryStyle}
      />
      <header className="flex h-6 min-w-0 shrink-0 items-center gap-1.5 px-4">
        <BookmarkIcon
          secondary
          size={IconSize.Size16}
          className="shrink-0 text-accent-bun-default"
        />
        <span className="truncate font-bold text-text-primary typo-caption1">
          Bookmarks
        </span>
        {!!posts.length && (
          // Only a page is fetched, so past it the count is "12+".
          <span className="shrink-0 font-bold tabular-nums text-text-tertiary typo-caption1">
            {posts.length}
            {data?.page.pageInfo.hasNextPage && '+'}
          </span>
        )}
        <Link href={bookmarksHref} passHref>
          <Button
            tag="a"
            href={bookmarksHref}
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.XSmall}
            className="-mr-2 ml-auto"
          >
            View all
          </Button>
        </Link>
      </header>
      {posts.length ? (
        <div
          ref={scroll.ref}
          onScroll={scroll.onScroll}
          style={scroll.style}
          className={classNames('mt-2 px-2', scroll.className)}
        >
          <ul
            className={classNames(
              'gap-1',
              size === FeedWidgetSize.Large
                ? 'grid grid-cols-2 gap-x-4'
                : 'flex flex-col',
            )}
          >
            {posts.map((post, index) => (
              <ReadingListRow
                key={post.id}
                post={post}
                onClick={() => logClick(post, index)}
              />
            ))}
          </ul>
        </div>
      ) : (
        <FeedWidgetEmpty
          kind={FeedWidgetKind.ReadingList}
          isPending={isEnabled && isPending}
          message="Nothing saved yet. Bookmark posts to find them here."
        />
      )}
    </div>
  );
};
