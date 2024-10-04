import React, { forwardRef, ReactElement, Ref, useRef } from 'react';
import classNames from 'classnames';
import { Container, generateTitleClamp, PostCardProps } from '../common/common';
import { usePostImage } from '../../../hooks/post/usePostImage';
import FeedItemContainer from '../common/FeedItemContainer';
import { FreeformCardTitle, getPostClassNames } from '../common/Card';
import CardOverlay from '../common/CardOverlay';
import OptionsButton from '../../buttons/OptionsButton';
import { SquadPostCardHeader } from '../common/SquadPostCardHeader';
import PostMetadata from '../common/PostMetadata';
import { WelcomePostCardFooter } from '../common/WelcomePostCardFooter';
import ActionButtons from '../ActionsButtons/ActionButtons';

export const FreeformGrid = forwardRef(function SharePostCard(
  {
    post,
    onPostClick,
    onPostAuxClick,
    onUpvoteClick,
    onCommentClick,
    onMenuClick,
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
      <OptionsButton
        className="absolute right-2 top-2 group-hover:flex laptop:hidden"
        onClick={(event) => onMenuClick?.(event, post)}
        tooltipPlacement="top"
      />
      <SquadPostCardHeader
        author={post.author}
        source={post.source}
        enableSourceHeader={enableSourceHeader}
        bookmarked={post.bookmarked}
      />
      <FreeformCardTitle
        className={classNames(
          generateTitleClamp({
            hasImage: !!image,
            hasHtmlContent: !!post.contentHtml,
          }),
        )}
      >
        {post.title}
      </FreeformCardTitle>
      {!!post.author && (
        <>
          {image && <div className="flex-1" />}
          <PostMetadata
            className={classNames(
              'mx-2 mb-1 line-clamp-1 break-words',
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
