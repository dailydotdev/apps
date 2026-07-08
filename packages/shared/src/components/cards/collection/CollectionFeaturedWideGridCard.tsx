import type { ReactElement, Ref } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';
import type { PostCardProps } from '../common/common';
import { Container } from '../common/common';
import FeedItemContainer from '../common/FeedItemContainer';
import { useBlockPostPanel } from '../../../hooks/post/useBlockPostPanel';
import { useHiddenFeedbackPanel } from '../../../hooks/post/useHiddenFeedbackPanel';
import { isPostUpdated } from '../../../graphql/posts';
import { TimeFormatType } from '../../../lib/dateFormat';
import { PostTagsPanel } from '../../post/block/PostTagsPanel';
import {
  CardSpace,
  CardTextContainer,
  getPostClassNames,
} from '../common/Card';
import CardOverlay from '../common/CardOverlay';
import PostTags from '../common/PostTags';
import PostMetadata from '../common/PostMetadata';
import ActionButtons from '../common/ActionButtons';
import { FeedCardGlassActions } from '../common/FeedCardGlassActions';
import { ClickbaitShield } from '../common/ClickbaitShield';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import { useFeedCardGlassActions } from '../../../hooks/useFeedCardGlassActions';
import { usePostImage } from '../../../hooks/post/usePostImage';
import { HIGH_PRIORITY_IMAGE_PROPS, Image, ImageType } from '../../image/Image';
import { CollectionCardHeader } from './CollectionCardHeader';
import { HighlightChip } from '../common/HighlightChip';
import { WhyFeaturedButton } from '../common/WhyFeaturedButton';
import type { FeaturedWideColSpan } from '../common/featuredWide';
import { INNER_GRID_COLS, IMAGE_COL_SPAN } from '../common/featuredWide';

export const CollectionFeaturedWideGridCard = forwardRef(
  function CollectionFeaturedWideGridCard(
    {
      post,
      onPostClick,
      onPostAuxClick,
      onUpvoteClick,
      onDownvoteClick,
      onCommentClick,
      onBookmarkClick,
      onCopyLinkClick,
      children,
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
    const { title } = useSmartTitle(post);
    const image = usePostImage(post);
    const glassActions = useFeedCardGlassActions();
    const useGlass = glassActions;
    const significance = post.hero?.significance;
    const wasUpdated = isPostUpdated(post);

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
              <CollectionCardHeader post={post} />
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
                <HighlightChip
                  significance={significance}
                  className="shrink-0"
                />
                <PostTags post={post} className="min-w-0 flex-1" />
              </div>
              <PostMetadata
                createdAt={wasUpdated ? post.updatedAt : post.createdAt}
                dateLabel={wasUpdated ? 'Updated' : undefined}
                dateType={
                  wasUpdated ? TimeFormatType.PostUpdated : TimeFormatType.Post
                }
                readTime={post.readTime}
                numSources={post.numCollectionSources}
                className="mt-1"
              />
              {post.summary ? (
                <p className="mt-2 line-clamp-3 text-text-secondary typo-callout">
                  {post.summary}
                </p>
              ) : null}
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
              <Image
                alt={post.title}
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
