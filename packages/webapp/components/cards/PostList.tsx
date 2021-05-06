import React, { ReactElement, useState } from 'react';
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
  CardNotification,
} from './Card';
import PostLink from './PostLink';
import PostMetadata from './PostMetadata';
import ActionButtons from './ActionButtons';
import SourceButton from './SourceButton';
import classNames from 'classnames';
import styles from '../../styles/cards.module.css';
import ListFeaturedComment from './ListFeaturedComment';
import Button from '../buttons/Button';
import FlagIcon from '../../icons/flag.svg';
import { getTooltipProps } from '../../lib/tooltip';
import TrendingFlag from './TrendingFlag';
import PostAuthor from './PostAuthor';

export function PostList({
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
  notification,
  className,
  children,
  ...props
}: PostCardProps): ReactElement {
  const [selectedComment, setSelectedComment] = useState<Comment>();

  const { trending } = post;

  const card = (
    <ListCard
      {...props}
      className={getPostClassNames(post, selectedComment, className)}
    >
      <PostLink post={post} openNewTab={openNewTab} onLinkClick={onLinkClick} />
      <ListCardAside>
        <SourceButton post={post} className="pb-2" tooltipPosition="up" />
        {featuredCommentsToButtons(
          post.featuredComments,
          setSelectedComment,
          null,
          'my-1',
          'up',
        )}
      </ListCardAside>
      <ListCardDivider />
      <ListCardMain>
        <ListCardTitle>{post.title}</ListCardTitle>
        <PostMetadata post={post} className="my-1">
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
          className="relative mt-1 self-stretch"
        >
          {enableMenu && (
            <Button
              className={classNames(
                'btn-tertiary',
                !menuOpened && 'mouse:invisible mouse:group-hover:visible',
              )}
              style={{ marginLeft: 'auto' }}
              buttonSize="small"
              icon={<FlagIcon />}
              onClick={(event) => onMenuClick?.(event, post)}
              pressed={menuOpened}
              {...getTooltipProps('Report post')}
            />
          )}
          {notification && (
            <CardNotification className="absolute bottom-0 right-0 z-2">
              {notification}
            </CardNotification>
          )}
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
}
