import React, { forwardRef, ReactElement, Ref } from 'react';
import { PostCardProps } from './common';
import {
  getPostClassNames,
  ListCardTitle,
  ListCardDivider,
  ListCardAside,
  ListCardMain,
  CardButton,
} from './Card';
import PostMetadata from './PostMetadata';
import ActionButtons from './ActionButtons';
import SourceButton from './SourceButton';
import PostAuthor from './PostAuthor';
import FeedItemContainer from './FeedItemContainer';
import { PostTagsPanel } from '../post/block/PostTagsPanel';
import { useBlockPost } from '../../hooks/post/useBlockPost';

export const PostList = forwardRef(function PostList(
  {
    post,
    onPostClick,
    onUpvoteClick,
    onCommentClick,
    onBookmarkClick,
    onReadArticleClick,
    onMenuClick,
    onShare,
    onShareClick,
    openNewTab,
    enableMenu,
    menuOpened,
    className,
    children,
    ...props
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { data } = useBlockPost(post);
  const onPostCardClick = () => onPostClick(post);
  const { trending, pinnedAt } = post;

  if (data?.showTagsPanel && post.tags.length > 0) {
    return (
      <PostTagsPanel
        className="overflow-hidden h-full max-h-[23.5rem]"
        post={post}
      />
    );
  }

  return (
    <FeedItemContainer
      {...props}
      className={getPostClassNames(post, className)}
      ref={ref}
      flagProps={{ listMode: true, pinnedAt, trending }}
    >
      <CardButton title={post.title} onClick={onPostCardClick} />
      <ListCardAside className="w-14">
        <SourceButton
          source={post?.source}
          className="pb-2"
          tooltipPosition="top"
        />
      </ListCardAside>
      <ListCardDivider className="mb-1" />
      <ListCardMain>
        <ListCardTitle>{post.title}</ListCardTitle>
        <PostMetadata
          createdAt={post.createdAt}
          readTime={post.readTime}
          className="my-1"
        >
          {post.author && <PostAuthor author={post.author} className="ml-2" />}
        </PostMetadata>
        <ActionButtons
          post={post}
          openNewTab={openNewTab}
          onUpvoteClick={onUpvoteClick}
          onCommentClick={onCommentClick}
          onBookmarkClick={onBookmarkClick}
          onReadArticleClick={onReadArticleClick}
          onShare={onShare}
          onShareClick={onShareClick}
          className="relative self-stretch mt-1"
          onMenuClick={(event) => onMenuClick?.(event, post)}
          insaneMode
        />
      </ListCardMain>
      {children}
    </FeedItemContainer>
  );
});
