import React, { forwardRef, ReactElement, Ref } from 'react';
import classNames from 'classnames';
import { PostCardProps } from './PostCard';
import {
  getPostClassNames,
  ListCard,
  ListCardTitle,
  ListCardDivider,
  ListCardAside,
  ListCardMain,
} from './Card';
import PostLink from './PostLink';
import PostMetadata from './PostMetadata';
import ActionButtons from './ActionButtons';
import SourceButton from './SourceButton';
import styles from './Card.module.css';
import TrendingFlag from './TrendingFlag';
import PostAuthor from './PostAuthor';
import PostOptions from '../buttons/OptionsButton';

export const PostList = forwardRef(function PostList(
  {
    post,
    onLinkClick,
    onUpvoteClick,
    onCommentClick,
    onBookmarkClick,
    onMenuClick,
    showShare,
    onShare,
    openNewTab,
    enableMenu,
    menuOpened,
    className,
    children,
    postHeadingFont,
    ...props
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { trending } = post;

  const card = (
    <ListCard
      {...props}
      className={getPostClassNames(post, className)}
      ref={ref}
    >
      <PostLink post={post} openNewTab={openNewTab} onLinkClick={onLinkClick} />
      <ListCardAside>
        <SourceButton post={post} className="pb-2" tooltipPosition="top" />
      </ListCardAside>
      <ListCardDivider />
      <ListCardMain>
        <ListCardTitle className={classNames(className, postHeadingFont)}>
          {post.title}
        </ListCardTitle>
        <PostMetadata
          createdAt={post.createdAt}
          readTime={post.readTime}
          className="my-1"
        >
          <PostAuthor post={post} className="ml-2" />
        </PostMetadata>
        <ActionButtons
          post={post}
          onUpvoteClick={onUpvoteClick}
          onCommentClick={onCommentClick}
          onBookmarkClick={onBookmarkClick}
          showShare={showShare}
          onShare={onShare}
          className="relative self-stretch mt-1"
        >
          <PostOptions
            onClick={(event) => onMenuClick?.(event, post)}
            post={post}
          />
        </ActionButtons>
      </ListCardMain>
      {children}
    </ListCard>
  );
  if (trending) {
    return (
      <div className={`relative ${styles.cardContainer}`}>
        {card}
        <TrendingFlag trending={trending} listMode />
      </div>
    );
  }
  return card;
});
