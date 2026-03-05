import type { ReactElement, Ref } from 'react';
import React, { forwardRef, useMemo } from 'react';
import classNames from 'classnames';
import type { PostCardProps } from '../common';
import { useFeedPreviewMode } from '../../../../hooks';
import { publishTimeRelativeShort } from '../../../../lib/dateFormat';
import { isVideoPost, PostType } from '../../../../graphql/posts';
import { stripHtmlTags } from '../../../../lib/strings';
import { UNKNOWN_SOURCE_ID } from '../../../../lib/utils';
import { isPlaceholderImage } from '../../../../lib/image';
import FeedItemContainer from './FeedItemContainer';
import { useSmartTitle } from '../../../../hooks/post/useSmartTitle';
import {
  BookmarkIcon,
  DiscussIcon,
  ShareIcon,
  UpvoteIcon,
} from '../../../icons';
import { IconSize } from '../../../Icon';
import { Image } from '../../../image/Image';

const resolveBySource = <T,>(
  sourceId: string | undefined,
  sourceValue: T | undefined,
  creatorValue: T | undefined,
): T | undefined =>
  sourceId === UNKNOWN_SOURCE_ID ? creatorValue : sourceValue || creatorValue;

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
  const resolvedTitle = title?.trim() || post.title?.trim() || '';
  const isTweetPost =
    post.type === PostType.SocialTwitter ||
    post.sharedPost?.type === PostType.SocialTwitter;
  const shouldUseSharedPostContent =
    post.subType === 'repost' && !post.contentHtml?.trim();
  const description = useMemo(() => {
    if (isTweetPost) {
      const primaryTweetContent =
        stripHtmlTags(post.contentHtml ?? '').trim() ||
        post.title?.trim() ||
        '';
      const sharedTweetContent =
        stripHtmlTags(post.sharedPost?.contentHtml ?? '').trim() ||
        post.sharedPost?.title?.trim() ||
        '';
      return shouldUseSharedPostContent
        ? sharedTweetContent || primaryTweetContent || ''
        : primaryTweetContent || sharedTweetContent || '';
    }

    return post.summary?.trim() || post.sharedPost?.summary?.trim() || '';
  }, [
    isTweetPost,
    shouldUseSharedPostContent,
    post.contentHtml,
    post.title,
    post.sharedPost?.title,
    post.sharedPost?.contentHtml,
    post.sharedPost?.summary,
    post.summary,
  ]);
  const tweetMedia = useMemo(() => {
    if (!isTweetPost) {
      return '';
    }

    const primaryTweetMedia = post.image || '';
    const sharedTweetMedia = post.sharedPost?.image || '';
    const mediaSrc = shouldUseSharedPostContent
      ? sharedTweetMedia || primaryTweetMedia
      : primaryTweetMedia || sharedTweetMedia;
    if (!mediaSrc || isPlaceholderImage(mediaSrc)) {
      return '';
    }

    return mediaSrc;
  }, [
    isTweetPost,
    shouldUseSharedPostContent,
    post.image,
    post.sharedPost?.image,
  ]);
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
  const sharedPostHandle = resolveBySource(
    post.sharedPost?.source?.id,
    post.sharedPost?.source?.handle,
    post.sharedPost?.creatorTwitter || post.creatorTwitter,
  );
  const retweetedHandle =
    isTweetPost && post.subType === 'repost'
      ? sharedPostHandle?.trim() || ''
      : '';
  const repostLabel = retweetedHandle ? `RT @${retweetedHandle}` : '';
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
          title: resolvedTitle || post.title,
          href: post.commentsPermalink,
          onClick: onPostCardClick,
        }
      }
      bookmarked={post.bookmarked}
    >
      <div className="flex flex-col gap-1 px-4 py-3 text-left">
        {(sourceName || repostLabel || relativeTimeLabel) && (
          <div className="flex items-center gap-1 text-[15px] text-text-quaternary">
            {sourceName && <span>{sourceName}</span>}
            {sourceName && repostLabel && <span>&middot;</span>}
            {repostLabel && <span>{repostLabel}</span>}
            {(sourceName || repostLabel) && relativeTimeLabel && (
              <span>&middot;</span>
            )}
            {relativeTimeLabel && <span>{relativeTimeLabel}</span>}
          </div>
        )}
        {!isTweetPost && (
          <p className="text-[15px] font-bold leading-snug text-text-primary">
            {resolvedTitle}
          </p>
        )}
        {!!description && (
          <p
            className={classNames(
              'text-[15px] leading-[20px] text-text-secondary',
              isTweetPost && 'whitespace-pre-line',
            )}
          >
            {description}
          </p>
        )}
        {!!tweetMedia && (
          <div className="mt-2 overflow-hidden rounded-12">
            <Image
              src={tweetMedia}
              alt="Tweet media"
              className="block h-auto w-full max-w-96"
              loading="lazy"
            />
          </div>
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
