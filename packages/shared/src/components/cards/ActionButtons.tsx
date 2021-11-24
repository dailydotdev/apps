import React, { ReactElement, ReactNode, useRef } from 'react';
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
import { getShouldLoadTooltip } from '../tooltips/LazyTooltip';

const ShareIcon = dynamic(() => import('../../../icons/share.svg'));
const Tooltip = dynamic(
  () => import(/* webpackChunkName: "tooltip" */ '../tooltips/Tooltip'),
);

const LazyTooltip = dynamic(
  () => import(/* webpackChunkName: "lazyTooltip" */ '../tooltips/LazyTooltip'),
);

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
  const commentRef = useRef();

  return (
    <div
      className={classNames(
        styles.actionButtons,
        'flex flex-row items-center',
        className,
      )}
    >
      <Tooltip content={post.upvoted ? 'Remove upvote' : 'Upvote'}>
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
      </Tooltip>
      {getShouldLoadTooltip() && (
        <LazyTooltip content="Comments" reference={commentRef} />
      )}
      <Link href={post.commentsPermalink} passHref prefetch={false}>
        <QuaternaryButton
          id={`post-${post.id}-comment-btn`}
          tag="a"
          icon={<CommentIcon />}
          buttonSize="small"
          pressed={post.commented}
          aria-label="Comments"
          onClick={() => onCommentClick?.(post)}
          style={{ width: rem(78) }}
          className="btn-tertiary-avocado"
          ref={commentRef}
        >
          <InteractionCounter
            value={post.numComments > 0 && post.numComments}
          />
        </QuaternaryButton>
      </Link>
      <Tooltip content={post.bookmarked ? 'Remove bookmark' : 'Bookmark'}>
        <Button
          icon={<BookmarkIcon />}
          buttonSize="small"
          pressed={post.bookmarked}
          onClick={() => onBookmarkClick?.(post, !post.bookmarked)}
          className="btn-tertiary-bun"
        />
      </Tooltip>
      {showShare && (
        <Tooltip content="Share post">
          <Button
            icon={<ShareIcon />}
            buttonSize="small"
            onClick={() => onShare?.(post)}
            className="btn-tertiary"
          />
        </Tooltip>
      )}
      {children}
    </div>
  );
}
