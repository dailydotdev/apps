import type { Ref } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';
import type { PostCardProps } from '../common/common';
import { Container } from '../common/common';
import FeedItemContainer from '../common/FeedItemContainer';
import { CollectionCardHeader } from './CollectionCardHeader';
import {
  getPostClassNames,
  FreeformCardTitle,
  CardTextContainer,
  CardSpace,
} from '../common/Card';
import { WelcomePostCardFooter } from '../common/WelcomePostCardFooter';
import ActionButtons from '../common/ActionButtons';
import {
  FeedCardGlassActions,
  glassCoverImageClassName,
} from '../common/FeedCardGlassActions';
import PostMetadata from '../common/PostMetadata';
import { usePostImage } from '../../../hooks/post/usePostImage';
import { useFeedCardGlassActions } from '../../../hooks/useFeedCardGlassActions';
import CardOverlay from '../common/CardOverlay';
import PostTags from '../common/PostTags';
import { isPostUpdated } from '../../../graphql/posts';
import { TimeFormatType } from '../../../lib/dateFormat';
import { useHiddenFeedbackPanel } from '../../../hooks/post/useHiddenFeedbackPanel';

export const CollectionGrid = forwardRef(function CollectionCard(
  {
    children,
    post,
    domProps = {},
    onUpvoteClick,
    onCommentClick,
    onCopyLinkClick,
    onPostClick,
    onPostAuxClick,
    onBookmarkClick,
    onDownvoteClick,
    onShare,
  }: PostCardProps,
  ref: Ref<HTMLElement>,
) {
  const { pinnedAt, trending } = post;
  const image = usePostImage(post);
  const wasUpdated = isPostUpdated(post);
  const onPostCardClick = () => onPostClick?.(post);
  const onPostCardAuxClick = () => onPostAuxClick?.(post);
  const { isHidden, content: hiddenPanel } = useHiddenFeedbackPanel(post);
  const useGlass = useFeedCardGlassActions();

  if (isHidden) {
    return (
      <FeedItemContainer
        domProps={{
          ...domProps,
          className: getPostClassNames(
            post,
            domProps.className ?? '',
            'min-h-card',
          ),
        }}
        ref={ref}
        flagProps={{ pinnedAt, trending }}
        bookmarked={post.bookmarked}
      >
        {hiddenPanel}
      </FeedItemContainer>
    );
  }

  const postMetadata = (
    <PostMetadata
      createdAt={wasUpdated ? post.updatedAt : post.createdAt}
      dateLabel={wasUpdated ? 'Updated' : undefined}
      dateType={wasUpdated ? TimeFormatType.PostUpdated : TimeFormatType.Post}
      readTime={post.readTime}
      numSources={post.numCollectionSources}
      className="mx-4"
    />
  );

  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        className: getPostClassNames(
          post,
          domProps.className ?? '',
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
      <CardTextContainer className="mx-4">
        <CollectionCardHeader post={post} />
        <FreeformCardTitle
          className={classNames(
            // Match the default article card's title guideline: clamp to 3 lines
            // at natural height (no fixed reserve).
            'line-clamp-3',
            'font-bold text-text-primary typo-title3',
          )}
        >
          {post.title}
        </FreeformCardTitle>
      </CardTextContainer>
      {/* Push the tags + date to the bottom of the text area, just above the
          footer (cover image or freeform text preview), matching the default
          article card so they align regardless of title length. */}
      <Container>
        <CardSpace />
        <PostTags post={post} className="mx-4" />
        {postMetadata}
      </Container>
      <Container className={useGlass && image ? 'flex-none' : undefined}>
        <WelcomePostCardFooter
          image={image}
          contentHtml={post.contentHtml}
          post={post}
          onShare={onShare}
          glassActions={useGlass}
          imageClassName={
            useGlass && image ? glassCoverImageClassName : undefined
          }
          // Give the freeform text preview the same footer height as the cover
          // image slot (h-40 image + its mt-2/mb-1 margins = 10.5rem) so the
          // tags/date bottom-anchor to the same row as the image cards and the
          // default article card.
          contentClassName="min-h-[10.5rem]"
        />
        {useGlass ? (
          <FeedCardGlassActions
            post={post}
            onUpvoteClick={onUpvoteClick}
            onCommentClick={onCommentClick}
            onCopyLinkClick={onCopyLinkClick}
            onBookmarkClick={onBookmarkClick}
            onDownvoteClick={onDownvoteClick}
            coverScrim={!!image}
          />
        ) : (
          <ActionButtons
            post={post}
            onUpvoteClick={onUpvoteClick}
            onCommentClick={onCommentClick}
            onCopyLinkClick={onCopyLinkClick}
            onBookmarkClick={onBookmarkClick}
            className="mt-auto"
            onDownvoteClick={onDownvoteClick}
          />
        )}
      </Container>
      {children}
    </FeedItemContainer>
  );
});
