import type { ReactElement, Ref } from 'react';
import React, { forwardRef, useMemo } from 'react';
import classNames from 'classnames';
import type { PostCardProps } from '../common/common';
import { Container } from '../common/common';
import FeedItemContainer from '../common/FeedItemContainer';
import { useBlockPostPanel } from '../../../hooks/post/useBlockPostPanel';
import { useHiddenFeedbackPanel } from '../../../hooks/post/useHiddenFeedbackPanel';
import { usePostFeedback } from '../../../hooks';
import { isVideoPost, PostType } from '../../../graphql/posts';
import type { PostHighlightSignificance } from '../../../graphql/posts';
import { PostTagsPanel } from '../../post/block/PostTagsPanel';
import {
  CardSpace,
  CardTextContainer,
  getPostClassNames,
} from '../common/Card';
import CardOverlay from '../common/CardOverlay';
import { Origin } from '../../../lib/log';
import { PostCardHeader } from '../common/PostCardHeader';
import PostTags from '../common/PostTags';
import PostMetadata from '../common/PostMetadata';
import ActionButtons from '../common/ActionButtons';
import { FeedbackGrid } from './feedback/FeedbackGrid';
import { ClickbaitShield } from '../common/ClickbaitShield';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import { usePostImage } from '../../../hooks/post/usePostImage';
import { HIGH_PRIORITY_IMAGE_PROPS, Image, ImageType } from '../../image/Image';
import { stripHtmlTags } from '../../../lib/strings';

export type FeaturedWideColSpan = 2 | 3 | 4;

const INNER_GRID_COLS: Record<FeaturedWideColSpan, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
};

const IMAGE_COL_SPAN: Record<FeaturedWideColSpan, string> = {
  2: 'col-span-1',
  3: 'col-span-2',
  4: 'col-span-3',
};

const CHIP_LABEL: Partial<Record<PostHighlightSignificance, string>> = {
  breaking: 'Breaking',
  major: 'Major',
  notable: 'Notable',
};

const HighlightChip = ({
  significance,
  className,
}: {
  significance: PostHighlightSignificance | null | undefined;
  className?: string;
}): ReactElement | null => {
  if (!significance) {
    return null;
  }
  const label = CHIP_LABEL[significance];
  if (!label) {
    return null;
  }
  return (
    <span
      className={classNames(
        'pointer-events-none relative inline-flex w-fit',
        className,
      )}
    >
      <span
        aria-hidden
        className="breaking-news-chip-glow absolute -inset-0.5 rounded-8 opacity-40 blur-[2px] motion-reduce:animate-none"
      />
      <span className="breaking-news-chip-fill relative block overflow-hidden rounded-8 px-2 py-0.5 font-bold text-white shadow-[0_0_6px_color-mix(in_srgb,var(--theme-accent-ketchup-default)_30%,transparent)] typo-caption2">
        {label}
      </span>
    </span>
  );
};

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
      openNewTab,
      children,
      onReadArticleClick,
      domProps = {},
      eagerLoadImage = false,
      wideColSpan = 2,
    }: PostCardProps & { wideColSpan?: FeaturedWideColSpan },
    ref: Ref<HTMLElement>,
  ): ReactElement {
    const { className, style } = domProps;
    const { isHidden, content: hiddenPanel } = useHiddenFeedbackPanel(post);
    const { data } = useBlockPostPanel(post);
    const onPostCardClick = () => onPostClick?.(post);
    const onPostCardAuxClick = () => onPostAuxClick?.(post);
    const { pinnedAt, trending } = post;
    const { showFeedback } = usePostFeedback({ post });
    const { title } = useSmartTitle(post);
    const isVideoType = isVideoPost(post);
    const image = usePostImage(post);
    const significance = post.postHighlight?.significance ?? null;
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

    if (isHidden) {
      return (
        <FeedItemContainer
          domProps={{
            ...domProps,
            style,
            className: getPostClassNames(post, className ?? '', 'min-h-card'),
          }}
          ref={ref}
          flagProps={{ pinnedAt, trending }}
          bookmarked={post.bookmarked}
        >
          {hiddenPanel}
        </FeedItemContainer>
      );
    }

    if (data?.showTagsPanel && (post.tags?.length ?? 0) > 0) {
      return (
        <PostTagsPanel
          className="h-full overflow-hidden"
          post={post}
          toastOnSuccess
        />
      );
    }

    return (
      <FeedItemContainer
        domProps={{
          ...domProps,
          style,
          className: getPostClassNames(
            post,
            classNames(className ?? '', 'h-full overflow-hidden'),
            'min-h-card',
          ),
        }}
        ref={ref}
        flagProps={{ pinnedAt, trending }}
        bookmarked={post.bookmarked && !showFeedback}
      >
        <CardOverlay
          post={post}
          onPostCardClick={onPostCardClick}
          onPostCardAuxClick={onPostCardAuxClick}
        />

        <div
          className={classNames(
            'absolute inset-0 grid h-full min-h-0 gap-3 overflow-hidden laptop:gap-4',
            INNER_GRID_COLS[wideColSpan],
          )}
        >
          <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
            {showFeedback ? (
              <>
                <h3 className="line-clamp-2 break-words px-6 pt-6 font-bold text-text-primary typo-title3">
                  {title}
                </h3>
                <FeedbackGrid
                  post={post}
                  onUpvoteClick={() =>
                    onUpvoteClick?.(post, Origin.FeedbackCard)
                  }
                  onDownvoteClick={() =>
                    onDownvoteClick?.(post, Origin.FeedbackCard)
                  }
                  isVideoType={isVideoType}
                />
              </>
            ) : (
              <>
                <CardTextContainer>
                  <PostCardHeader
                    post={post}
                    className="flex"
                    openNewTab={openNewTab}
                    source={post.source!}
                    postLink={post.permalink!}
                    onReadArticleClick={onReadArticleClick}
                    showFeedback={false}
                  />
                  <h3 className="mt-2 line-clamp-4 break-words font-bold text-text-primary typo-title1">
                    {title}
                  </h3>
                  <div className="mt-2 flex min-w-0 items-center gap-2">
                    {post.clickbaitTitleDetected && (
                      <ClickbaitShield post={post} />
                    )}
                    <HighlightChip
                      significance={significance}
                      className="shrink-0"
                    />
                    <PostTags post={post} className="min-w-0 flex-1" />
                  </div>
                  <PostMetadata
                    createdAt={post.createdAt}
                    readTime={post.readTime}
                    isVideoType={isVideoType}
                    className="mt-1"
                  />
                  {description ? (
                    <p className="mt-2 line-clamp-3 text-text-secondary typo-callout">
                      {description}
                    </p>
                  ) : null}
                </CardTextContainer>
                <Container>
                  <CardSpace />
                  <ActionButtons
                    post={post}
                    onUpvoteClick={onUpvoteClick}
                    onCommentClick={onCommentClick}
                    onCopyLinkClick={onCopyLinkClick}
                    onBookmarkClick={onBookmarkClick}
                    onDownvoteClick={onDownvoteClick}
                    variant="grid"
                  />
                </Container>
              </>
            )}
          </div>
          {image ? (
            <div
              className={classNames(
                'relative h-full min-w-0 overflow-hidden rounded-r-16',
                IMAGE_COL_SPAN[wideColSpan],
              )}
            >
              <Image
                alt={post.title}
                src={image}
                type={ImageType.Post}
                className="size-full object-cover"
                {...(eagerLoadImage ? HIGH_PRIORITY_IMAGE_PROPS : {})}
              />
            </div>
          ) : null}
        </div>
        {children}
      </FeedItemContainer>
    );
  },
);
