import React, { ReactElement, ReactNode } from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import styles from './Card.module.css';
import { Post } from '../../graphql/posts';
import UpvoteIcon from '../../../icons/upvote.svg';
import rem from '../../../macros/rem.macro';
import InteractionCounter from '../InteractionCounter';
import { QuaternaryButton } from '../buttons/QuaternaryButton';
import CommentIcon from '../../../icons/comment.svg';
import BookmarkIcon from '../../../icons/bookmark.svg';
import { Button } from '../buttons/Button';

const LazyTooltip = dynamic(() => import('../tooltips/LazyTooltip'));

const ShareIcon = dynamic(() => import('../../../icons/share.svg'));

export type ActionButtonsProps = {
  post: Post;
  showShare: boolean;
  onUpvoteClick?: (post: Post, upvoted: boolean) => unknown;
  onCommentClick?: (post: Post) => unknown;
  onBookmarkClick?: (post: Post, bookmarked: boolean) => unknown;
  onShare?: (post: Post) => unknown;
  className?: string;
  children?: ReactNode;
};

export default function ActionButtons({
  post,
  showShare,
  onUpvoteClick,
  onCommentClick,
  onBookmarkClick,
  onShare,
  className,
  children,
}: ActionButtonsProps): ReactElement {
  return (
    <div
      className={classNames(
        styles.actionButtons,
        'flex flex-row items-center',
        className,
      )}
    >
      <LazyTooltip content={post.upvoted ? 'Remove upvote' : 'Upvote'}>
        <QuaternaryButton
          id={`post-${post.id}-upvote-btn`}
          icon={<UpvoteIcon />}
          buttonSize="small"
          pressed={post.upvoted}
          onClick={() => onUpvoteClick?.(post, !post.upvoted)}
          style={{ width: rem(78) }}
          className="btn-tertiary-avocado"
        >
          <InteractionCounter value={post.numUpvotes > 0 && post.numUpvotes} />
        </QuaternaryButton>
      </LazyTooltip>
      <Link href={post.commentsPermalink} passHref prefetch={false}>
        <LazyTooltip content="Comments">
          <QuaternaryButton
            id={`post-${post.id}-comment-btn`}
            tag="a"
            icon={<CommentIcon />}
            buttonSize="small"
            pressed={post.commented}
            onClick={() => onCommentClick?.(post)}
            style={{ width: rem(78) }}
            className="btn-tertiary-avocado"
          >
            <InteractionCounter
              value={post.numComments > 0 && post.numComments}
            />
          </QuaternaryButton>
        </LazyTooltip>
      </Link>
      <LazyTooltip content={post.bookmarked ? 'Remove bookmark' : 'Bookmark'}>
        <Button
          icon={<BookmarkIcon />}
          buttonSize="small"
          pressed={post.bookmarked}
          onClick={() => onBookmarkClick?.(post, !post.bookmarked)}
          className="btn-tertiary-bun"
        />
      </LazyTooltip>
      {showShare && (
        <LazyTooltip content="Share post">
          <Button
            icon={<ShareIcon />}
            buttonSize="small"
            onClick={() => onShare?.(post)}
            className="btn-tertiary"
          />
        </LazyTooltip>
      )}
      {children}
    </div>
  );
}
