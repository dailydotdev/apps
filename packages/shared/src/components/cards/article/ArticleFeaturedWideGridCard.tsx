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
import { FeedCardGlassActions } from '../common/FeedCardGlassActions';
import { FeedbackGrid } from './feedback/FeedbackGrid';
import { ClickbaitShield } from '../common/ClickbaitShield';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import { useFeedCardGlassActions } from '../../../hooks/useFeedCardGlassActions';
import { usePostImage } from '../../../hooks/post/usePostImage';
import { useCardCover } from '../../../hooks/feed/useCardCover';
import { HIGH_PRIORITY_IMAGE_PROPS, Image, ImageType } from '../../image/Image';
import { PlayIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { stripHtmlTags } from '../../../lib/strings';
import { HighlightChip } from '../common/HighlightChip';
import { WhyFeaturedButton } from '../common/WhyFeaturedButton';
import type { FeaturedWideColSpan } from '../common/featuredWide';
import { INNER_GRID_COLS, IMAGE_COL_SPAN } from '../common/featuredWide';

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
    }: PostCardProps & { wideColSpan?: FeaturedWideColSpan },
    ref: Ref<HTMLElement>,
  ): ReactElement {
    const { className, style } = domProps;
    const { isHidden, content: hiddenPanel } = useHiddenFeedbackPanel(post);
    const { data } = useBlockPostPanel(post);
    const onPostCardClick = () => onPostClick?.(post);
    const onPostCardAuxClick = () => onPostAuxClick?.(post);
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

    if (isHidden) {
      return (
        <FeedItemContainer
          domProps={{
            ...domProps,
            style,
            className: getPostClassNames(post, className ?? '', 'min-h-card'),
          }}
          ref={ref}
          flagProps={{ pinnedAt }}
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
            useGlass ? 'min-h-cardGlass' : 'min-h-card',
          ),
        }}
        ref={ref}
        flagProps={{ pinnedAt }}
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
          <div className="relative flex min-h-0 min-w-0 flex-col overflow-hidden">
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
                <CardTextContainer
                  className={
                    useGlass ? 'min-h-0 flex-1 overflow-hidden' : undefined
                  }
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
                {useGlass ? (
                  <>
                    {/* Reserve the floating bar's footprint (h-10 + bottom-2)
                        plus a small gap in the flow so the clipped text column
                        always ends above it — long titles or summaries can never
                        render behind the bar. */}
                    <div aria-hidden className="h-14 shrink-0" />
                    <FeedCardGlassActions
                      post={post}
                      onUpvoteClick={onUpvoteClick}
                      onCommentClick={onCommentClick}
                      onCopyLinkClick={onCopyLinkClick}
                      onBookmarkClick={onBookmarkClick}
                      onDownvoteClick={onDownvoteClick}
                    />
                  </>
                ) : (
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
                )}
              </>
            )}
          </div>
          {image ? (
            <div
              className={classNames(
                'relative flex h-full min-w-0 items-center justify-center overflow-hidden rounded-r-16',
                IMAGE_COL_SPAN[wideColSpan],
              )}
            >
              <WhyFeaturedButton significance={significance} />
              <Image
                aria-hidden
                alt=""
                src={image}
                type={ImageType.Post}
                className="absolute inset-0 size-full scale-110 object-cover blur-xl"
              />
              {overlay}
              {isVideoType && !overlay && (
                <>
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-overlay-tertiary-black"
                  />
                  <PlayIcon
                    secondary
                    size={IconSize.XXLarge}
                    data-testid="playIconVideoPost"
                    className="absolute"
                  />
                </>
              )}
              <Image
                alt={post.title}
                src={image}
                type={ImageType.Post}
                className={classNames(
                  'relative size-full object-contain',
                  !!overlay && 'opacity-16',
                )}
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
