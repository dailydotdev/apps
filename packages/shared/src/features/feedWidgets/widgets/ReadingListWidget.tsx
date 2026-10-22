import type { CSSProperties, ReactElement } from 'react';
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
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

// The list scrolls, so one fetch covers every size and resizing never refetches.
const READING_LIST_FIRST = 12;

const bookmarksHref = `${webappUrl}bookmarks`;

// The widget's own material, a warm library wash, kept low so the list leads.
const libraryStyle: CSSProperties = {
  backgroundImage:
    'linear-gradient(to top, color-mix(in srgb, var(--theme-accent-bun-default) 20%, transparent) 0%, transparent 55%), radial-gradient(80% 50% at 100% 0%, color-mix(in srgb, var(--theme-accent-bun-default) 12%, transparent) 0%, transparent 70%)',
};

/** Each edge fades only while there is more beyond it. */
const useScrollEdges = () => {
  const node = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ isAtTop: true, isAtEnd: true });

  const measure = useCallback(() => {
    const element = node.current;
    if (!element) {
      return;
    }
    const isAtTop = element.scrollTop <= 1;
    const isAtEnd =
      element.scrollTop + element.clientHeight >= element.scrollHeight - 1;
    setEdges((current) =>
      current.isAtTop === isAtTop && current.isAtEnd === isAtEnd
        ? current
        : { isAtTop, isAtEnd },
    );
  }, []);

  useLayoutEffect(() => {
    measure();
    const element = node.current;
    if (!element || typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [measure]);

  const top = edges.isAtTop ? 'black 0' : 'transparent 0, black 2.5rem';
  const bottom = edges.isAtEnd
    ? 'black 100%'
    : 'black calc(100% - 2.5rem), transparent 100%';
  const mask = `linear-gradient(to bottom, ${top}, ${bottom})`;

  return {
    ref: node,
    onScroll: measure,
    style: { maskImage: mask, WebkitMaskImage: mask } as CSSProperties,
  };
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

/** The reader's unread bookmarks, oldest first so nothing rots. */
export const ReadingListWidget = ({
  size,
}: FeedWidgetComponentProps<FeedWidgetKind.ReadingList>): ReactElement => {
  const { user, isTokenValid } = useAuthContext();
  const { logEvent } = useLogContext();
  const postLogEvent = usePostLogEvent();
  const scroll = useScrollEdges();
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
          Reading list
        </span>
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
          // A vertical swipe over the rail always moves the page on touch.
          className="mt-2 min-h-0 flex-1 snap-y snap-proximity overflow-y-auto px-2 [@media(pointer:coarse)]:overflow-y-hidden"
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
          message="You're all caught up. Bookmark posts to read them later."
        />
      )}
    </div>
  );
};
