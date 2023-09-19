import React, { forwardRef, ReactElement, Ref } from 'react';
import classNames from 'classnames';
import {
  CardButton,
  CardSpace,
  CardTextContainer,
  CardTitle,
  getPostClassNames,
} from './Card';
import PostMetadata from './PostMetadata';
import ActionButtons from './ActionButtons';
import { PostCardHeader } from './PostCardHeader';
import { PostCardFooter } from './PostCardFooter';
import { Container, PostCardProps } from './common';
import FeedItemContainer from './FeedItemContainer';
import { useBlockPostPanel } from '../../hooks/post/useBlockPostPanel';
import { PostTagsPanel } from '../post/block/PostTagsPanel';

export const ArticlePostCard = forwardRef(function PostCard(
  {
    post,
    onPostClick,
    onUpvoteClick,
    onCommentClick,
    onBookmarkClick,
    onMenuClick,
    onShare,
    onShareClick,
    openNewTab,
    children,
    showImage = true,
    insaneMode,
    onReadArticleClick,
    domProps = {},
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { className, style } = domProps;
  const { data } = useBlockPostPanel(post);
  const onPostCardClick = () => onPostClick(post);
  const { trending, pinnedAt } = post;
  const customStyle = !showImage ? { minHeight: '15.125rem' } : {};

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
        style: { ...style, ...customStyle },
        className: getPostClassNames(post, className, 'min-h-[22.5rem]'),
      }}
      ref={ref}
      flagProps={{ pinnedAt, trending }}
    >
      <CardButton title={post.title} onClick={onPostCardClick} />
      <CardTextContainer>
        <PostCardHeader
          openNewTab={openNewTab}
          source={post.source}
          postLink={post.permalink}
          onMenuClick={(event) => onMenuClick?.(event, post)}
          onReadArticleClick={onReadArticleClick}
        />
        <CardTitle>{post.title}</CardTitle>
      </CardTextContainer>
      <Container className="mb-8 tablet:mb-0">
        <CardSpace />
        <PostMetadata
          createdAt={post.createdAt}
          readTime={post.readTime}
          className="mx-4"
        />
      </Container>
      <Container>
        <PostCardFooter
          insaneMode={insaneMode}
          openNewTab={openNewTab}
          post={post}
          showImage={showImage}
          onReadArticleClick={onReadArticleClick}
        />
        <ActionButtons
          openNewTab={openNewTab}
          post={post}
          onUpvoteClick={onUpvoteClick}
          onCommentClick={onCommentClick}
          onBookmarkClick={onBookmarkClick}
          onShare={onShare}
          onShareClick={onShareClick}
          onMenuClick={(event) => onMenuClick?.(event, post)}
          onReadArticleClick={onReadArticleClick}
          className={classNames(
            'mx-4 justify-between',
            !showImage && 'my-4 laptop:mb-0',
          )}
        />
      </Container>
      {children}
    </FeedItemContainer>
  );
});
