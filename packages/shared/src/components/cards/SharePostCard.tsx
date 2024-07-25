import React, { forwardRef, ReactElement, Ref, useRef } from 'react';
import {
  CardSpace,
  CardTextContainer,
  CardTitle,
  getPostClassNames,
} from './Card';
import ActionButtons from './ActionsButtons/ActionButtons';
import { Container, PostCardProps } from './common';
import FeedItemContainer from './FeedItemContainer';
import { isVideoPost } from '../../graphql/posts';
import CardOverlay from './common/CardOverlay';
import { PostCardHeader } from './PostCardHeader';
import { PostCardFooter } from './PostCardFooter';
import PostMetadata from './PostMetadata';
import PostTags from './PostTags';

export const SharePostCard = forwardRef(function SharePostCard(
  {
    post,
    onPostClick,
    onUpvoteClick,
    onCommentClick,
    onMenuClick,
    onCopyLinkClick,
    onBookmarkClick,
    openNewTab,
    children,
    onReadArticleClick,
    domProps = {},
    onDownvoteClick,
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { pinnedAt, trending } = post;
  const onPostCardClick = () => onPostClick(post);
  const containerRef = useRef<HTMLDivElement>();

  const isVideoType = isVideoPost(post);

  const footerPost = {
    ...post,
    image: post.sharedPost.image,
  };

  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        className: getPostClassNames(
          post,
          domProps.className,
          'min-h-card max-h-card',
        ),
      }}
      ref={ref}
      flagProps={{ pinnedAt, trending }}
      bookmarked={post.bookmarked}
    >
      <CardOverlay post={post} onPostCardClick={onPostCardClick} />

      <>
        <CardTextContainer>
          <PostCardHeader
            post={post}
            className="flex"
            openNewTab={openNewTab}
            source={post.source}
            postLink={post.sharedPost.permalink}
            onMenuClick={(event) => onMenuClick?.(event, post)}
            onReadArticleClick={onReadArticleClick}
          />
          <CardTitle>{post?.title || post.sharedPost.title}</CardTitle>
        </CardTextContainer>
        <Container>
          <CardSpace />
          <PostTags tags={post.sharedPost.tags} />
          <PostMetadata
            createdAt={post.createdAt}
            readTime={post.sharedPost.readTime}
            isVideoType={isVideoType}
            className="mx-4"
          />
        </Container>
      </>
      <Container ref={containerRef}>
        <PostCardFooter
          openNewTab={openNewTab}
          post={footerPost}
          className={{}}
        />
        <ActionButtons
          post={post}
          onUpvoteClick={onUpvoteClick}
          onCommentClick={onCommentClick}
          onCopyLinkClick={onCopyLinkClick}
          onBookmarkClick={onBookmarkClick}
          onDownvoteClick={onDownvoteClick}
        />
      </Container>
      {children}
    </FeedItemContainer>
  );
});
