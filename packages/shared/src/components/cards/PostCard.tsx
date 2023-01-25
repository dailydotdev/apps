import React, { forwardRef, ReactElement, Ref } from 'react';
import classNames from 'classnames';
import {
  Card,
  CardButton,
  CardSpace,
  CardTextContainer,
  CardTitle,
  getPostClassNames,
} from './Card';
import styles from './Card.module.css';
import TrendingFlag from './TrendingFlag';
import PostMetadata from './PostMetadata';
import ActionButtons from './ActionButtons';
import { PostCardHeader } from './PostCardHeader';
import { PostCardFooter } from './PostCardFooter';
import { Containter, PostCardProps } from './common';

export const PostCard = forwardRef(function PostCard(
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
    enableMenu,
    menuOpened,
    className,
    children,
    showImage = true,
    style,
    insaneMode,
    onReadArticleClick,
    ...props
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const onPostCardClick = () => onPostClick(post);
  const { trending } = post;
  const customStyle = !showImage ? { minHeight: '15.125rem' } : {};
  const card = (
    <Card
      {...props}
      className={getPostClassNames(post, className, 'min-h-[22.5rem]')}
      style={{ ...style, ...customStyle }}
      ref={ref}
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
      <Containter className="mb-8 tablet:mb-0">
        <CardSpace />
        <PostMetadata
          createdAt={post.createdAt}
          readTime={post.readTime}
          className="mx-4"
        />
      </Containter>
      <Containter>
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
      </Containter>
      {children}
    </Card>
  );

  if (trending) {
    return (
      <div className={`relative ${styles.cardContainer}`}>
        {card}
        <TrendingFlag trending={trending} />
      </div>
    );
  }
  return card;
});
