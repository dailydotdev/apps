import React, { forwardRef, ReactElement, Ref } from 'react';
import { PostCardProps } from './common';
import {
  getPostClassNames,
  ListCardTitle,
  ListCardMain,
  CardButton,
} from './Card';
import PostMetadata from './PostMetadata';
import ActionButtons from './ActionButtons';
import SourceButton from './SourceButton';
import PostAuthor from './PostAuthor';
import FeedItemContainer from './FeedItemContainer';
import { PostTagsPanel } from '../post/block/PostTagsPanel';
import { useBlockPostPanel } from '../../hooks/post/useBlockPostPanel';
import { PostType } from '../../graphql/posts';

export const PostList = forwardRef(function PostList(
  {
    post,
    onPostClick,
    onUpvoteClick,
    onCommentClick,
    onReadArticleClick,
    onMenuClick,
    onShare,
    onShareClick,
    onBookmarkClick,
    openNewTab,
    children,
    domProps = {},
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { data } = useBlockPostPanel(post);
  const onPostCardClick = () => onPostClick(post);
  const { trending, pinnedAt, type, sharedPost } = post;
  const isVideoType =
    type === PostType.VideoYouTube ||
    sharedPost?.type === PostType.VideoYouTube;

  if (data?.showTagsPanel && post.tags.length > 0) {
    return (
      <PostTagsPanel
        className="overflow-hidden h-full max-h-[23.5rem]"
        post={post}
        toastOnSuccess
      />
    );
  }

  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        className: getPostClassNames(post, domProps.className),
      }}
      ref={ref}
      flagProps={{ listMode: true, pinnedAt, trending }}
    >
      <CardButton title={post.title} onClick={onPostCardClick} />
      <ListCardMain>
        <SourceButton
          source={post?.source}
          className="mb-2.5"
          tooltipPosition="top"
        />
        <ListCardTitle>{post.title}</ListCardTitle>
        <PostMetadata
          createdAt={post.createdAt}
          readTime={post.readTime}
          className="my-1"
          isVideoType={isVideoType}
          insaneMode
        >
          {post.author && <PostAuthor author={post.author} className="ml-2" />}
        </PostMetadata>
        <ActionButtons
          post={post}
          openNewTab={openNewTab}
          onUpvoteClick={onUpvoteClick}
          onCommentClick={onCommentClick}
          onReadArticleClick={onReadArticleClick}
          onShare={onShare}
          onShareClick={onShareClick}
          onBookmarkClick={onBookmarkClick}
          className="relative self-stretch mt-1"
          onMenuClick={(event) => onMenuClick?.(event, post)}
          insaneMode
          isVideoType={isVideoType}
        />
      </ListCardMain>
      {children}
    </FeedItemContainer>
  );
});
