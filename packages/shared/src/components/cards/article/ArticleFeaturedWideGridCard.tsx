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
import type { PostHeroSignificance } from '../../../graphql/types';
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
import { useFitFontSize } from '../../../hooks/useFitFontSize';
import { useFeedCardGlassActions } from '../../../hooks/useFeedCardGlassActions';
import { usePostImage } from '../../../hooks/post/usePostImage';
import { useCardCover } from '../../../hooks/feed/useCardCover';
import { HIGH_PRIORITY_IMAGE_PROPS, Image, ImageType } from '../../image/Image';
import { PlayIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { stripHtmlTags } from '../../../lib/strings';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureHeroCards } from '../../../lib/featureManagement';
import { SimpleTooltip } from '../../tooltips';
import { isTesting } from '../../../lib/constants';

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

// The hero title shrinks (title1 → title3) to stay within three lines so the
// summary below always has room, rather than spilling onto a fourth line and
// pushing the TLDR off the card.
const HERO_TITLE_SIZE_CLASSES = ['typo-title1', 'typo-title2', 'typo-title3'];
const HERO_TITLE_MAX_LINES = 3;

const HighlightChip = ({
  significance,
  className,
}: {
  significance: PostHeroSignificance | null | undefined;
  className?: string;
}): ReactElement | null => {
  const { value: heroCardsConfig } = useConditionalFeature({
    feature: featureHeroCards,
    shouldEvaluate: !!significance,
  });
  if (!significance || !heroCardsConfig.enabled) {
    return null;
  }
  const label = heroCardsConfig.chipLabels[significance];
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

const WhyFeaturedButton = ({
  significance,
}: {
  significance: PostHeroSignificance | null | undefined;
}): ReactElement | null => {
  const { value: heroCardsConfig } = useConditionalFeature({
    feature: featureHeroCards,
    shouldEvaluate: !!significance,
  });
  if (!significance || !heroCardsConfig.enabled) {
    return null;
  }
  const label = heroCardsConfig.chipLabels[significance];
  if (!label) {
    return null;
  }
  return (
    <SimpleTooltip
      forceLoad={!isTesting}
      content={`This card is highlighted because we think it's '${label}'. You can disable hero cards in Settings → Appearance.`}
    >
      <button
        type="button"
        aria-label="Why is this card featured?"
        className="absolute right-3 top-3 z-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/24 bg-overlay-secondary-pepper font-bold leading-none text-white backdrop-blur-md typo-callout hover:bg-overlay-primary-pepper"
      >
        ?
      </button>
    </SimpleTooltip>
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
    const {
      ref: titleRef,
      sizeClass: titleSizeClass,
      isClamped: titleClamped,
    } = useFitFontSize<HTMLHeadingElement>({
      text: title,
      sizeClasses: HERO_TITLE_SIZE_CLASSES,
      maxLines: HERO_TITLE_MAX_LINES,
    });
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
                    ref={titleRef}
                    className={classNames(
                      'mt-2 break-words font-bold text-text-primary',
                      titleSizeClass,
                      titleClamped && 'line-clamp-3',
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
