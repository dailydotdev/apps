import React, { forwardRef, ReactElement, Ref, useState } from 'react';
import { Comment } from '../../graphql/comments';
import { PostCardProps } from './PostCard';
import {
  getPostClassNames,
  ListCard,
  ListCardTitle,
  ListCardDivider,
  ListCardAside,
  ListCardMain,
  featuredCommentsToButtons,
} from './Card';
import PostLink from './PostLink';
import PostMetadata from './PostMetadata';
import ActionButtons from './ActionButtons';
import SourceButton from './SourceButton';
import styles from './Card.module.css';
import ListFeaturedComment from './ListFeaturedComment';
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
    ...props
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const [selectedComment, setSelectedComment] = useState<Comment>();

  const { trending } = post;

  const card = (
    <ListCard
      {...props}
      className={getPostClassNames(post, selectedComment, className)}
      ref={ref}
    >
      <PostLink post={post} openNewTab={openNewTab} onLinkClick={onLinkClick} />
      <ListCardAside>
        <SourceButton post={post} className="pb-2" tooltipPosition="top" />
        {featuredCommentsToButtons(
          post.featuredComments,
          setSelectedComment,
          null,
          'my-1',
          'top',
        )}
      </ListCardAside>
      <ListCardDivider />
      <ListCardMain>
        <ListCardTitle className={className}>{post.title}</ListCardTitle>
        <PostMetadata
          createdAt={post.createdAt}
          readTime={post.readTime}
          className="my-1"
        >
          <PostAuthor
            post={post}
            selectedComment={selectedComment}
            className="ml-2"
          />
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
      {selectedComment && (
        <ListFeaturedComment
          comment={selectedComment}
          featuredComments={post.featuredComments}
          onCommentClick={setSelectedComment}
          onBack={() => setSelectedComment(null)}
          className={styles.show}
        />
      )}
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
