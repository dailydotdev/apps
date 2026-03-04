import type { ReactElement, Ref } from 'react';
import React, { forwardRef, useMemo } from 'react';
import classNames from 'classnames';
import type { PostCardProps } from '../common';
import { useFeedPreviewMode, useTruncatedSummary } from '../../../../hooks';
import { publishTimeRelativeShort } from '../../../../lib/dateFormat';
import { isVideoPost, PostType } from '../../../../graphql/posts';
import FeedItemContainer from './FeedItemContainer';
import { useSmartTitle } from '../../../../hooks/post/useSmartTitle';
import {
  BookmarkIcon,
  DiscussIcon,
  ShareIcon,
  UpvoteIcon,
} from '../../../icons';
import { IconSize } from '../../../Icon';

export const SignalList = forwardRef(function SignalList(
  {
    post,
    onPostClick,
    onUpvoteClick,
    onCommentClick,
    onCopyLinkClick,
    onBookmarkClick,
    children,
    domProps = {},
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const isFeedPreview = useFeedPreviewMode();
  const onPostCardClick = () => onPostClick?.(post);
  const { title } = useSmartTitle(post);
  const { title: truncatedTitle } = useTruncatedSummary(title);
  const summary = useMemo(() => {
    const translatedSummary =
      typeof post.translation?.summary === 'string'
        ? post.translation.summary
        : undefined;
    const value = translatedSummary || post.summary || post.description;

    return value?.trim() || '';
  }, [post.description, post.summary, post.translation?.summary]);
  const typeLabel = useMemo(() => {
    if (isVideoPost(post)) {
      return 'Video';
    }

    if (
      post.type === PostType.SocialTwitter ||
      post.sharedPost?.type === PostType.SocialTwitter
    ) {
      return 'Tweet';
    }

    return 'Article';
  }, [post]);
  const sourceName = post.source?.name?.trim();
  const relativeTimeLabel = post.createdAt
    ? publishTimeRelativeShort(post.createdAt)
    : null;

  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        className: classNames(
          '!rounded-none !border-x-0 !px-0 !py-0 first:!border-t-0',
          domProps.className,
        ),
      }}
      ref={ref}
      flagProps={{
        pinnedAt: post.pinnedAt,
        trending: post.trending,
        type: typeLabel,
      }}
      linkProps={
        !isFeedPreview && {
          title: truncatedTitle || post.title,
          href: post.commentsPermalink,
          onClick: onPostCardClick,
        }
      }
      bookmarked={post.bookmarked}
    >
      <div className="flex flex-col gap-1 px-4 py-3 text-left">
        {(sourceName || relativeTimeLabel) && (
          <div className="flex items-center gap-1 text-[15px] text-text-quaternary">
            {sourceName && <span>{sourceName}</span>}
            {sourceName && relativeTimeLabel && <span>&middot;</span>}
            {relativeTimeLabel && <span>{relativeTimeLabel}</span>}
          </div>
        )}
        <p className="line-clamp-2 text-[15px] font-bold leading-snug text-text-primary">
          {truncatedTitle}
        </p>
        {!!summary && (
          <p className="line-clamp-3 text-[15px] leading-[20px] text-text-secondary">
            {summary}
          </p>
        )}
        <div className="relative z-1 mt-2 flex items-center justify-between text-text-quaternary">
          <button
            type="button"
            className="flex items-center gap-1 transition-colors hover:text-text-secondary"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onUpvoteClick?.(post);
            }}
          >
            <UpvoteIcon size={IconSize.XSmall} />
            {post.numUpvotes > 0 && (
              <span className="text-xs">{post.numUpvotes}</span>
            )}
          </button>
          <button
            type="button"
            className="flex items-center gap-1 transition-colors hover:text-text-secondary"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onCommentClick?.(post);
            }}
          >
            <DiscussIcon size={IconSize.XSmall} />
            {post.numComments > 0 && (
              <span className="text-xs">{post.numComments}</span>
            )}
          </button>
          <button
            type="button"
            className="flex items-center gap-1 transition-colors hover:text-text-secondary"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onBookmarkClick?.(post);
            }}
          >
            <BookmarkIcon size={IconSize.XSmall} />
          </button>
          <button
            type="button"
            className="flex items-center gap-1 transition-colors hover:text-text-secondary"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onCopyLinkClick?.(event, post);
            }}
          >
            <ShareIcon size={IconSize.XSmall} />
          </button>
        </div>
      </div>
      {children}
    </FeedItemContainer>
  );
});
