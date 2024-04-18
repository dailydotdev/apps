import React, { forwardRef, ReactElement, Ref } from 'react';
import { PostCardProps } from './common';
import {
  CardButton,
  getPostClassNames,
  ListCardMain,
  ListCardTitle,
} from './Card';
import PostMetadata from './PostMetadata';
import ActionButtons from './ActionButtons';
import SourceButton from './SourceButton';
import PostAuthor from './PostAuthor';
import FeedItemContainer from './FeedItemContainer';
import { PostTagsPanel } from '../post/block/PostTagsPanel';
import { useBlockPostPanel } from '../../hooks/post/useBlockPostPanel';
import { CollectionPillSources } from '../post/collection';
import { isVideoPost, PostType } from '../../graphql/posts';

export const PostList = forwardRef(function PostList(
  {
    post,
    onPostClick,
    onUpvoteClick,
    onCommentClick,
    onReadArticleClick,
    onMenuClick,
    onCopyLinkClick,
    onBookmarkClick,
    openNewTab,
    children,
    domProps = {},
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { data } = useBlockPostPanel(post);
  const onPostCardClick = () => onPostClick(post);
  const { pinnedAt, trending } = post;
  const isVideoType = isVideoPost(post);
  const isCollectionPost = post.type === PostType.Collection;

  if (data?.showTagsPanel && post.tags.length > 0) {
    return (
      <PostTagsPanel
        className="h-full max-h-[23.5rem] overflow-hidden"
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
      flagProps={{
        listMode: true,
        pinnedAt,
        trending,
      }}
    >
      <CardButton title={post.title} onClick={onPostCardClick} />
      <ListCardMain>
        {isCollectionPost && (
          <CollectionPillSources
            className={{ main: 'mb-2.5' }}
            sources={post.collectionSources}
            totalSources={post.numCollectionSources}
          />
        )}
        {!isCollectionPost && (
          <SourceButton
            source={post?.source}
            className="mb-2.5"
            tooltipPosition="top"
          />
        )}
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
          onCopyLinkClick={onCopyLinkClick}
          onBookmarkClick={onBookmarkClick}
          className="relative mt-1 self-stretch"
          onMenuClick={(event) => onMenuClick?.(event, post)}
          insaneMode
        />
      </ListCardMain>
      {children}
    </FeedItemContainer>
  );
});
