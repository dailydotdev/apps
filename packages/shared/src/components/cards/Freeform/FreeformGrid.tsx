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
import ActionButtons from '../ActionsButtons/ActionButtons';
import { ClickbaitShield } from '../common/ClickbaitShield';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';

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
      <SquadPostCardHeader
        post={post}
        enableSourceHeader={enableSourceHeader}
      />
      <CardTextContainer>
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
      {!!post.author && (
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
      )}
      <Container ref={containerRef}>
        <WelcomePostCardFooter
          image={image}
          contentHtml={post.contentHtml}
          post={post}
        />
        <ActionButtons
          post={post}
          onUpvoteClick={onUpvoteClick}
          onCommentClick={onCommentClick}
          onCopyLinkClick={onCopyLinkClick}
          onBookmarkClick={onBookmarkClick}
          className="mt-auto"
          onDownvoteClick={onDownvoteClick}
        />
      </Container>
      {children}
    </FeedItemContainer>
  );
});
