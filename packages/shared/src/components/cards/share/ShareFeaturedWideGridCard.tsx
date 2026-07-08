import type { ReactElement, Ref } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';
import { Container } from '../common/common';
import FeedItemContainer from '../common/FeedItemContainer';
import { useBlockPostPanel } from '../../../hooks/post/useBlockPostPanel';
import { useHiddenFeedbackPanel } from '../../../hooks/post/useHiddenFeedbackPanel';
import { isSocialTwitterPost, isVideoPost } from '../../../graphql/posts';
import { PostTagsPanel } from '../../post/block/PostTagsPanel';
import {
  CardSpace,
  CardTextContainer,
  getPostClassNames,
} from '../common/Card';
import CardOverlay from '../common/CardOverlay';
import { PostCardHeader } from '../common/PostCardHeader';
import PostTags from '../common/PostTags';
import PostMetadata from '../common/PostMetadata';
import ActionButtons from '../common/ActionButtons';
import { FeedCardGlassActions } from '../common/FeedCardGlassActions';
import { ClickbaitShield } from '../common/ClickbaitShield';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import { useFeedCardGlassActions } from '../../../hooks/useFeedCardGlassActions';
import { usePostImage } from '../../../hooks/post/usePostImage';
import { HIGH_PRIORITY_IMAGE_PROPS, Image, ImageType } from '../../image/Image';
import { BlockIcon, PlayIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { Typography, TypographyType } from '../../typography/Typography';
import { DeletedPostId } from '../../../lib/constants';
import { HighlightChip } from '../common/HighlightChip';
import { WhyFeaturedButton } from '../common/WhyFeaturedButton';
import type { FeaturedWideCardProps } from '../common/featuredWide';
import { INNER_GRID_COLS, IMAGE_COL_SPAN } from '../common/featuredWide';

export const ShareFeaturedWideGridCard = forwardRef(
  function ShareFeaturedWideGridCard(
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
    }: FeaturedWideCardProps,
    ref: Ref<HTMLElement>,
  ): ReactElement {
    const { className, style } = domProps;
    const { isHidden, content: hiddenPanel } = useHiddenFeedbackPanel(post);
    const { data } = useBlockPostPanel(post);
    const onPostCardClick = () => onPostClick?.(post);
    const onPostCardAuxClick = () => onPostAuxClick?.(post);
    const { pinnedAt, trending } = post;
    const { title } = useSmartTitle(post);
    const { sharedPost } = post;
    const isDeleted = sharedPost?.id === DeletedPostId;
    const postImage = usePostImage(post);
    const image = isDeleted ? undefined : postImage;
    const isVideoType = isVideoPost(post);
    const isSharedTweet = isSocialTwitterPost(sharedPost);
    const glassActions = useFeedCardGlassActions();
    const useGlass = glassActions;
    const significance = post.hero?.significance;
    const sharedTitle = sharedPost?.title?.trim();
    const sharedSummary = sharedPost?.summary?.trim();

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
            useGlass ? 'min-h-cardGlass' : 'min-h-card',
          ),
        }}
        ref={ref}
        flagProps={{ pinnedAt, trending }}
        bookmarked={post.bookmarked}
      >
        <CardOverlay
          post={post}
          onPostCardClick={onPostCardClick}
          onPostCardAuxClick={onPostCardAuxClick}
          ariaLabel={title}
        />

        <div
          className={classNames(
            'absolute inset-0 grid h-full min-h-0 gap-3 overflow-hidden laptop:gap-4',
            INNER_GRID_COLS[wideColSpan],
          )}
        >
          <div className="relative flex min-h-0 min-w-0 flex-col overflow-hidden">
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
                postLink={sharedPost?.permalink ?? post.permalink!}
                onReadArticleClick={onReadArticleClick}
              />
              {(!isSharedTweet || post.title) && (
                <h3
                  className={classNames(
                    'mt-2 break-words font-bold text-text-primary typo-title1',
                    useGlass ? 'line-clamp-3' : 'line-clamp-4',
                  )}
                >
                  {title}
                </h3>
              )}
              <div className="mt-2 flex min-w-0 items-center gap-2">
                {!post.title && sharedPost?.clickbaitTitleDetected && (
                  <ClickbaitShield post={post} />
                )}
                <HighlightChip
                  significance={significance}
                  className="shrink-0"
                />
                <PostTags
                  post={sharedPost || post}
                  className="min-w-0 flex-1"
                />
              </div>
              <PostMetadata
                createdAt={post.createdAt}
                readTime={sharedPost?.readTime}
                isVideoType={isVideoType}
                className="mt-1"
              />
              {isDeleted ? (
                <div className="mt-2 flex items-center gap-2 rounded-12 border border-border-subtlest-tertiary p-3 text-text-tertiary">
                  <BlockIcon size={IconSize.Size16} />
                  <Typography type={TypographyType.Footnote}>
                    This post is no longer available. It might have been removed
                    or the link has expired.
                  </Typography>
                </div>
              ) : (
                <>
                  {sharedTitle && sharedTitle !== title ? (
                    <p className="mt-2 line-clamp-2 break-words font-bold text-text-secondary typo-callout">
                      {sharedTitle}
                    </p>
                  ) : null}
                  {sharedSummary ? (
                    <p className="mt-2 line-clamp-3 text-text-secondary typo-callout">
                      {sharedSummary}
                    </p>
                  ) : null}
                </>
              )}
            </CardTextContainer>
            {useGlass ? (
              <>
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
              {isVideoType && (
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
                alt={sharedTitle || post.title}
                src={image}
                type={ImageType.Post}
                className="relative size-full object-contain"
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
