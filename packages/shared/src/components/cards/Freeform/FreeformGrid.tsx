import type { ReactElement, Ref } from 'react';
import React, { forwardRef, useRef } from 'react';
import classNames from 'classnames';
import type { PostCardProps } from '../common/common';
import { Container, generateTitleClamp } from '../common/common';
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
import { WelcomePostCardFooter } from '../common/WelcomePostCardFooter';
import ActionButtons from '../common/ActionButtons';
import { FeedCardGlassActions } from '../common/FeedCardGlassActions';
import { ClickbaitShield } from '../common/ClickbaitShield';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import { useFeedCardGlassActions } from '../../../hooks/useFeedCardGlassActions';
import { useHiddenFeedbackPanel } from '../../../hooks/post/useHiddenFeedbackPanel';

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
  const { isHidden, content: hiddenPanel } = useHiddenFeedbackPanel(post);
  const glassActions = useFeedCardGlassActions();
  // The floating glass bar applies to every freeform post. When there's a cover
  // image it floats over it full-bleed; for text/markdown posts it floats over
  // the bottom of the content (which blurs through the glass).
  const useGlass = glassActions;

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
        className: getPostClassNames(
          post,
          domProps.className,
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
      <CardTextContainer>
        <SquadPostCardHeader
          post={post}
          enableSourceHeader={enableSourceHeader}
        />
        <FreeformCardTitle
          className={classNames(
            generateTitleClamp({
              hasImage: !!image,
              hasHtmlContent: !!post.contentHtml,
            }),
          )}
        >
          {title}
        </FreeformCardTitle>
      </CardTextContainer>
      <>
        {image && <CardSpace />}
        <div
          className={classNames(
            'mx-4 mb-2 flex items-center',
            !image && 'mt-1',
          )}
        >
          {post.clickbaitTitleDetected && <ClickbaitShield post={post} />}
        </div>
        <PostMetadata
          className={classNames(
            'mx-4 line-clamp-1 break-words',
            image ? 'mt-0' : 'mt-1',
          )}
          createdAt={post.createdAt}
          readTime={post.readTime}
        />
      </>
      <Container
        ref={containerRef}
        className={useGlass && image ? 'flex-none' : undefined}
      >
        <WelcomePostCardFooter
          image={image}
          contentHtml={post.contentHtml}
          post={post}
        />
        {useGlass ? (
          <FeedCardGlassActions
            post={post}
            onUpvoteClick={onUpvoteClick}
            onCommentClick={onCommentClick}
            onCopyLinkClick={onCopyLinkClick}
            onBookmarkClick={onBookmarkClick}
            onDownvoteClick={onDownvoteClick}
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
