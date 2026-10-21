import type { ReactElement } from 'react';
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
import { unreadBookmarksQueryOptions } from '../../../graphql/bookmarks';
import { useCachedTokenRecovery } from '../../../hooks/useCachedTokenRecovery';
import styles from '../../../components/cards/common/Card.module.css';
import { CardLink } from '../../../components/cards/common/Card';
import { LazyImage } from '../../../components/LazyImage';
import { formatReadTime } from '../../../components/utilities/common';
import Link from '../../../components/utilities/Link';
import { combinedClicks } from '../../../lib/click';
import type { FeedWidgetComponentProps } from '../registry';
import { FeedWidgetKind, FeedWidgetSize } from '../types';
import { FeedWidgetEmpty } from '../FeedWidgetFrame';

/** Rows that fit each size, a two-line title each; Large is two columns. */
const rowsBySize: Record<FeedWidgetSize, number> = {
  [FeedWidgetSize.Small]: 1,
  [FeedWidgetSize.Tall]: 4,
  [FeedWidgetSize.Large]: 8,
};

// One fetch for every size, so resizing the widget never refetches.
const READING_LIST_FIRST = rowsBySize[FeedWidgetSize.Large];

const bookmarksHref = `${webappUrl}bookmarks`;

const ReadingListRow = ({
  post,
  onClick,
}: {
  post: Post;
  onClick: () => void;
}): ReactElement => {
  const title = post.title ?? post.sharedPost?.title;
  const readTime = post.readTime ?? post.sharedPost?.readTime;

  return (
    <article
      className={classNames(
        'group relative flex items-start gap-3 px-4 py-2 hover:bg-surface-hover',
        styles.card,
      )}
    >
      <Link href={getPostPath(post)} passHref prefetch={false}>
        <CardLink title={title} {...combinedClicks(onClick)} />
      </Link>
      <LazyImage
        imgSrc={post.source?.image ?? ''}
        imgAlt={post.source?.name ?? ''}
        className="mt-0.5 size-6 rounded-full"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h4 className="line-clamp-2 break-words text-text-primary typo-callout">
          {title}
        </h4>
        <span className="truncate text-text-tertiary typo-footnote">
          {post.source?.name}
          {!!readTime && ` · ${formatReadTime(readTime)} read`}
        </span>
      </div>
    </article>
  );
};

/** The reader's newest unread bookmarks, with the way to the rest. */
export const ReadingListWidget = ({
  size,
}: FeedWidgetComponentProps<FeedWidgetKind.ReadingList>): ReactElement => {
  const { user, isTokenValid } = useAuthContext();
  const { logEvent } = useLogContext();
  const postLogEvent = usePostLogEvent();
  const queryOptions = unreadBookmarksQueryOptions({
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

  const posts = (data?.page.edges ?? [])
    .slice(0, rowsBySize[size])
    .map(({ node }) => node);

  if (!posts.length) {
    return (
      <FeedWidgetEmpty
        kind={FeedWidgetKind.ReadingList}
        isPending={isEnabled && isPending}
        message="You're all caught up. Bookmark posts to read them later."
      />
    );
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col" data-size={size}>
      <header className="px-4 pb-2">
        <h3 className="font-bold text-text-primary typo-body">Reading list</h3>
      </header>
      <div
        className={classNames(
          'min-h-0 flex-1 overflow-hidden',
          size === FeedWidgetSize.Large && 'grid grid-cols-2 content-start',
        )}
      >
        {posts.map((post, index) => (
          <ReadingListRow
            key={post.id}
            post={post}
            onClick={() => logClick(post, index)}
          />
        ))}
      </div>
      <footer className="px-4 pt-1">
        <Link href={bookmarksHref} passHref>
          <a
            href={bookmarksHref}
            className="flex h-8 items-center text-text-tertiary typo-callout hover:text-text-primary"
          >
            See all bookmarks
            <span aria-hidden className="ml-auto">
              →
            </span>
          </a>
        </Link>
      </footer>
    </div>
  );
};
