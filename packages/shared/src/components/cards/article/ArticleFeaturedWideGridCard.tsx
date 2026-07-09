import type { ReactElement, Ref } from 'react';
import React, { forwardRef, useMemo } from 'react';
import classNames from 'classnames';
import { usePostFeedback } from '../../../hooks/usePostFeedback';
import { isVideoPost, PostType } from '../../../graphql/posts';
import { CardTextContainer } from '../common/Card';
import { Origin } from '../../../lib/log';
import { PostCardHeader } from '../common/PostCardHeader';
import PostTags from '../common/PostTags';
import PostMetadata from '../common/PostMetadata';
import { FeedbackGrid } from './feedback/FeedbackGrid';
import { ClickbaitShield } from '../common/ClickbaitShield';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import { useFeedCardGlassActions } from '../../../hooks/useFeedCardGlassActions';
import { usePostImage } from '../../../hooks/post/usePostImage';
import { useCardCover } from '../../../hooks/feed/useCardCover';
import { stripHtmlTags } from '../../../lib/strings';
import { HighlightChip } from '../common/HighlightChip';
import type { FeaturedWideCardProps } from '../common/featuredWide';
import { INNER_GRID_COLS } from '../common/featuredWide';
import { FeaturedWideCardShell } from '../common/FeaturedWideCardShell';
import { FeaturedWideImageColumn } from '../common/FeaturedWideImageColumn';
import { FeaturedWideActions } from '../common/FeaturedWideActions';

export const ArticleFeaturedWideGridCard = forwardRef(
  function ArticleFeaturedWideGridCard(
    {
      post,
      onPostClick,
      onPostAuxClick,
      onUpvoteClick,
      onDownvoteClick,
      onCommentClick,
      onBookmarkClick,
      onCopyLinkClick,
      onShare,
      openNewTab,
      children,
      onReadArticleClick,
      domProps = {},
      eagerLoadImage = false,
      wideColSpan = 2,
    }: FeaturedWideCardProps,
    ref: Ref<HTMLElement>,
  ): ReactElement {
    const { pinnedAt } = post;
    const { showFeedback } = usePostFeedback({ post });
    const { title } = useSmartTitle(post);
    const isVideoType = isVideoPost(post);
    const image = usePostImage(post);
    const { overlay } = useCardCover({ post, onShare });
    const glassActions = useFeedCardGlassActions();
    // The hero keeps the pill on the content column (where its bar already sat),
    // not over the cover image.
    const useGlass = glassActions && !showFeedback;
    const significance = post.hero?.significance;
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

    const feedbackContent = (
      <>
        <h3 className="line-clamp-2 break-words px-6 pt-6 font-bold text-text-primary typo-title3">
          {title}
        </h3>
        <FeedbackGrid
          post={post}
          onUpvoteClick={() => onUpvoteClick?.(post, Origin.FeedbackCard)}
          onDownvoteClick={() => onDownvoteClick?.(post, Origin.FeedbackCard)}
          isVideoType={isVideoType}
        />
      </>
    );

    const standardContent = (
      <>
        <CardTextContainer
          className={useGlass ? 'min-h-0 flex-1 overflow-hidden' : undefined}
        >
          <PostCardHeader
            post={post}
            className="flex"
            openNewTab={openNewTab}
            source={post.source!}
            postLink={post.permalink!}
            onReadArticleClick={onReadArticleClick}
            showFeedback={false}
          />
          <h3
            className={classNames(
              'mt-2 break-words font-bold text-text-primary typo-title1',
              useGlass ? 'line-clamp-3' : 'line-clamp-4',
            )}
          >
            {title}
          </h3>
          <div className="mt-2 flex min-w-0 items-center gap-2">
            {post.clickbaitTitleDetected && <ClickbaitShield post={post} />}
            <HighlightChip significance={significance} className="shrink-0" />
            <PostTags post={post} className="min-w-0 flex-1" />
          </div>
          <PostMetadata
            createdAt={post.createdAt}
            readTime={post.readTime}
            isVideoType={isVideoType}
            className="mt-1"
          />
          {!!description && (
            <p className="mt-2 line-clamp-3 text-text-secondary typo-callout">
              {description}
            </p>
          )}
        </CardTextContainer>
        <FeaturedWideActions
          post={post}
          useGlass={useGlass}
          onUpvoteClick={onUpvoteClick}
          onCommentClick={onCommentClick}
          onCopyLinkClick={onCopyLinkClick}
          onBookmarkClick={onBookmarkClick}
          onDownvoteClick={onDownvoteClick}
        />
      </>
    );

    return (
      <FeaturedWideCardShell
        ref={ref}
        post={post}
        domProps={domProps}
        useGlass={useGlass}
        onPostClick={onPostClick}
        onPostAuxClick={onPostAuxClick}
        flagProps={{ pinnedAt }}
        bookmarked={post.bookmarked && !showFeedback}
        significance={significance}
      >
        <div
          className={classNames(
            'absolute inset-0 grid h-full min-h-0 gap-3 overflow-hidden laptop:gap-4',
            image || overlay ? INNER_GRID_COLS[wideColSpan] : 'grid-cols-1',
          )}
        >
          <div className="relative flex min-h-0 min-w-0 flex-col overflow-hidden">
            {showFeedback ? feedbackContent : standardContent}
          </div>
          {(!!image || !!overlay) && (
            <FeaturedWideImageColumn
              image={image}
              alt={post.title ?? ''}
              wideColSpan={wideColSpan}
              overlay={overlay}
              isVideoType={isVideoType}
              eagerLoadImage={eagerLoadImage}
            />
          )}
        </div>
        {children}
      </FeaturedWideCardShell>
    );
  },
);
