import styles from '../../styles/cards.module.css';
import React, { ReactElement, ReactNode } from 'react';
import { Post } from '../../graphql/posts';
import UpvoteIcon from '../../icons/upvote.svg';
import { getTooltipProps } from '../../lib/tooltip';
import rem from '../../macros/rem.macro';
import InteractionCounter from '../InteractionCounter';
import QuaternaryButton from '../buttons/QuaternaryButton';
import CommentIcon from '../../icons/comment.svg';
import Link from 'next/link';
import BookmarkIcon from '../../icons/bookmark.svg';
import Button from '../buttons/Button';
import classNames from 'classnames';
import dynamic from 'next/dynamic';

const ShareIcon = dynamic(() => import('../../icons/share.svg'));

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
      <QuaternaryButton
        id={`post-${post.id}-upvote-btn`}
        icon={<UpvoteIcon />}
        buttonSize="small"
        pressed={post.upvoted}
        {...getTooltipProps(post.upvoted ? 'Remove upvote' : 'Upvote')}
        onClick={() => onUpvoteClick?.(post, !post.upvoted)}
        style={{ width: rem(78) }}
        className="btn-tertiary-avocado"
      >
        <InteractionCounter value={post.numUpvotes > 0 && post.numUpvotes} />
      </QuaternaryButton>
      <Link href={post.commentsPermalink} passHref prefetch={false}>
        <QuaternaryButton
          id={`post-${post.id}-comment-btn`}
          tag="a"
          icon={<CommentIcon />}
          buttonSize="small"
          pressed={post.commented}
          {...getTooltipProps('Comments')}
          onClick={() => onCommentClick?.(post)}
          style={{ width: rem(78) }}
          className="btn-tertiary-avocado"
        >
          <InteractionCounter
            value={post.numComments > 0 && post.numComments}
          />
        </QuaternaryButton>
      </Link>
      <Button
        icon={<BookmarkIcon />}
        buttonSize="small"
        pressed={post.bookmarked}
        {...getTooltipProps(post.bookmarked ? 'Remove bookmark' : 'Bookmark')}
        onClick={() => onBookmarkClick?.(post, !post.bookmarked)}
        className="btn-tertiary-bun"
      />
      {showShare && (
        <Button
          icon={<ShareIcon />}
          buttonSize="small"
          {...getTooltipProps('Share post')}
          onClick={() => onShare?.(post)}
          className="btn-tertiary"
        />
      )}
      {children}
    </div>
  );
}
