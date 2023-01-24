import React, { forwardRef, ReactElement, Ref } from 'react';
import { PostCardProps } from './PostCard';
import {
  getPostClassNames,
  ListCard,
  ListCardTitle,
  ListCardDivider,
  ListCardAside,
  ListCardMain,
  CardButton,
} from './Card';
import PostLink from './PostLink';
import PostMetadata from './PostMetadata';
import ActionButtons from './ActionButtons';
import SourceButton from './SourceButton';
import styles from './Card.module.css';
import TrendingFlag from './TrendingFlag';
import PostAuthor from './PostAuthor';

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
    postModalByDefault,
    postEngagementNonClickable,
    ...props
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const onPostCardClick = () => onPostClick(post);
  const { trending } = post;

  const card = (
    <ListCard
      {...props}
      className={getPostClassNames(post, className)}
      ref={ref}
    >
      {postModalByDefault ? (
        <CardButton title={post.title} onClick={onPostCardClick} />
      ) : (
        <PostLink
          title={post.title}
          href={post.permalink}
          openNewTab={openNewTab}
          onLinkClick={onPostCardClick}
        />
      )}
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
          <PostAuthor post={post} className="ml-2" />
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
          postModalByDefault={postModalByDefault}
          postEngagementNonClickable={postEngagementNonClickable}
        />
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
