import type { ReactElement, Ref } from 'react';
import React, { forwardRef, useRef } from 'react';
import type { PostCardProps } from '../common/common';
import { Container } from '../common/common';
import { usePostImage } from '../../../hooks/post/usePostImage';
import FeedItemContainer from '../common/FeedItemContainer';
import {
  CardSpace,
  CardTextContainer,
  FreeformCardTitle,
  getPostClassNames,
} from '../common/Card';
import CardOverlay from '../common/CardOverlay';
import { SquadPostCardHeader } from '../common/SquadPostCardHeader';
import PostMetadata from '../common/PostMetadata';
import { FreeformCardFooter } from '../common/FreeformCardFooter';
import ActionButtons from '../common/ActionButtons';
import { ClickbaitShield } from '../common/ClickbaitShield';
import PostTags from '../common/PostTags';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import { useHiddenFeedbackPanel } from '../../../hooks/post/useHiddenFeedbackPanel';
import { useCardSaveOnHover } from '../../../hooks/cards/useCardSaveOnHover';
import { CardHeaderBookmark } from '../common/CardHeaderBookmark';

export const FreeformGrid = forwardRef(function SharePostCard(
  {
    post,
    onPostClick,
    onPostAuxClick,
    onUpvoteClick,
    onCommentClick,
    onCopyLinkClick,
    onBookmarkClick,
    children,
    enableSourceHeader = false,
    domProps = {},
    onDownvoteClick,
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { pinnedAt, trending } = post;
  const onPostCardClick = () => onPostClick(post);
  const onPostCardAuxClick = () => onPostAuxClick(post);
  const containerRef = useRef<HTMLDivElement>();
  const image = usePostImage(post);
  const { title } = useSmartTitle(post);
  const saveOnHover = useCardSaveOnHover();
  const { isHidden, content: hiddenPanel } = useHiddenFeedbackPanel(post);

  if (isHidden) {
    return (
      <FeedItemContainer
        domProps={{
          ...domProps,
          className: getPostClassNames(post, domProps.className, 'min-h-card'),
        }}
        ref={ref}
        flagProps={{ pinnedAt, trending }}
        bookmarked={post.bookmarked}
      >
        {hiddenPanel}
      </FeedItemContainer>
    );
  }

  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        className: getPostClassNames(post, domProps.className, 'min-h-card'),
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
      <CardTextContainer>
        <SquadPostCardHeader
          post={post}
          enableSourceHeader={enableSourceHeader}
          bookmark={
            saveOnHover ? (
              <CardHeaderBookmark
                post={post}
                onBookmarkClick={onBookmarkClick}
              />
            ) : undefined
          }
        />
        <FreeformCardTitle className="line-clamp-3">{title}</FreeformCardTitle>
      </CardTextContainer>
      {/* Match the collection card: push the tags + date to the bottom of the
          text area, just above the footer (cover image or text preview). */}
      <Container>
        <CardSpace />
        <div className="mx-4 flex items-center">
          {post.clickbaitTitleDetected && <ClickbaitShield post={post} />}
          <PostTags post={post} />
        </div>
        <PostMetadata
          className="mx-4"
          createdAt={post.createdAt}
          readTime={post.readTime}
        />
      </Container>
      <Container ref={containerRef}>
        <FreeformCardFooter
          image={image}
          contentHtml={post.contentHtml}
          post={post}
          // pt-2 gives the text a bit of breathing room below the date without
          // growing the footer (box-border keeps min-h), matching the collection.
          contentClassName="min-h-[10.5rem] pt-2"
        />
        <ActionButtons
          post={post}
          onUpvoteClick={onUpvoteClick}
          onCommentClick={onCommentClick}
          onCopyLinkClick={onCopyLinkClick}
          onBookmarkClick={onBookmarkClick}
          bookmarkInHeader={saveOnHover}
          className="mt-auto"
          onDownvoteClick={onDownvoteClick}
        />
      </Container>
      {children}
    </FeedItemContainer>
  );
});
