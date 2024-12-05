import React, { forwardRef, ReactElement, Ref, useRef } from 'react';
import { Container, PostCardProps } from '../common/common';
import { isVideoPost } from '../../../graphql/posts';
import FeedItemContainer from '../common/FeedItemContainer';
import {
  CardSpace,
  CardTextContainer,
  CardTitle,
  getPostClassNames,
} from '../common/Card';
import CardOverlay from '../common/CardOverlay';
import { PostCardHeader } from '../common/PostCardHeader';
import PostTags from '../common/PostTags';
import PostMetadata from '../common/PostMetadata';
import { PostCardFooter } from '../common/PostCardFooter';
import ActionButtons from '../ActionsButtons';
import { ClickbaitShield } from '../common/ClickbaitShield';

export const ShareGrid = forwardRef(function ShareGrid(
  {
    post,
    onPostClick,
    onPostAuxClick,
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
  const onPostCardAuxClick = () => onPostAuxClick(post);
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
      <CardOverlay
        post={post}
        onPostCardClick={onPostCardClick}
        onPostCardAuxClick={onPostCardAuxClick}
      />

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
          <div className="mx-2 flex items-center">
            {post.sharedPost.clickbaitTitleDetected && <ClickbaitShield />}
            <PostTags tags={post.sharedPost.tags} />
          </div>
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
