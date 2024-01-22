import React, { forwardRef, ReactElement, Ref, useRef } from 'react';
import ActionButtons from './ActionButtons';
import { SharedPostText } from '../SharedPostText';
import { SharedPostCardFooter } from './SharedPostCardFooter';
import { Container, PostCardProps } from '../common';
import FeedItemContainer from './FeedItemContainer';
import { useFeedPreviewMode, useTruncatedSummary } from '../../../hooks';
import { isVideoPost } from '../../../graphql/posts';
import { PostCardHeader } from './PostCardHeader';
import SquadHeaderPicture from '../common/SquadHeaderPicture';

export const SharePostCard = forwardRef(function SharePostCard(
  {
    post,
    onPostClick,
    onUpvoteClick,
    onDownvoteClick,
    onCommentClick,
    onMenuClick,
    onShareClick,
    onBookmarkClick,
    openNewTab,
    children,
    onReadArticleClick,
    enableSourceHeader = false,
    domProps = {},
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { pinnedAt, trending, type } = post;
  const onPostCardClick = () => onPostClick(post);
  const containerRef = useRef<HTMLDivElement>();
  const isFeedPreview = useFeedPreviewMode();
  const isVideoType = isVideoPost(post);
  const { title } = useTruncatedSummary(post);

  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        className: domProps.className,
      }}
      ref={ref}
      flagProps={{ pinnedAt, trending, type }}
      linkProps={
        !isFeedPreview && {
          title: post.title,
          onClick: onPostCardClick,
          href: post.commentsPermalink,
        }
      }
    >
      <PostCardHeader
        post={post}
        onMenuClick={(event) => onMenuClick?.(event, post)}
        metadata={{
          topLabel: enableSourceHeader ? post.source.name : post.author.name,
          bottomLabel: enableSourceHeader
            ? post.author.name
            : `@${post.sharedPost?.source.handle}`,
        }}
      >
        <SquadHeaderPicture
          author={post.author}
          source={post.source}
          reverse={!enableSourceHeader}
        />
      </PostCardHeader>
      <SharedPostText title={title} />
      <Container
        ref={containerRef}
        className="pointer-events-none min-h-0 justify-end"
      >
        <SharedPostCardFooter
          sharedPost={post.sharedPost}
          isVideoType={isVideoType}
        />
        <ActionButtons
          openNewTab={openNewTab}
          post={post}
          onUpvoteClick={onUpvoteClick}
          onDownvoteClick={onDownvoteClick}
          onCommentClick={onCommentClick}
          onShareClick={onShareClick}
          onBookmarkClick={onBookmarkClick}
          onMenuClick={(event) => onMenuClick?.(event, post)}
          onReadArticleClick={onReadArticleClick}
        />
      </Container>
      {children}
    </FeedItemContainer>
  );
});
