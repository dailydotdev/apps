import React, { forwardRef, ReactElement, Ref } from 'react';
import { PostCardProps } from './common';
import {
  CardButton,
  getPostClassNames,
  ListCardAside,
  ListCardDivider,
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
import { PostType } from '../../graphql/posts';
import { CollectionPillSources } from '../post/collection';

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
    openNewTab,
    children,
    domProps = {},
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { data } = useBlockPostPanel(post);
  const onPostCardClick = () => onPostClick(post);
  const { trending, pinnedAt } = post;
  const isCollectionPost = post.type === PostType.Collection;

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
      {!isCollectionPost && (
        <>
          <ListCardAside className="w-14">
            <SourceButton
              source={post?.source}
              className="pb-2"
              tooltipPosition="top"
            />
          </ListCardAside>

          <ListCardDivider className="mb-1" />
        </>
      )}

      <ListCardMain>
        {isCollectionPost && (
          <div className="">
            <CollectionPillSources
              className="mb-2.5"
              sources={post.collectionSources}
              totalSources={post.numCollectionSources}
            />
          </div>
        )}
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
          onReadArticleClick={isCollectionPost ? undefined : onReadArticleClick}
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
