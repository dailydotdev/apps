import React, { ReactElement } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { Post, UserPostVote } from '../../../graphql/posts';
import InteractionCounter from '../../InteractionCounter';
import UpvoteIcon from '../../icons/Upvote';
import CommentIcon from '../../icons/Discuss';
import { Button, ButtonColor, ButtonVariant } from '../../buttons/ButtonV2';
import { SimpleTooltip } from '../../tooltips/SimpleTooltip';
import { useFeedPreviewMode } from '../../../hooks';
import BookmarkIcon from '../../icons/Bookmark';
import DownvoteIcon from '../../icons/Downvote';

const ShareIcon = dynamic(
  () => import(/* webpackChunkName: "share" */ '../../icons/Share'),
);

export interface ActionButtonsProps {
  post: Post;
  onMenuClick?: (e: React.MouseEvent) => unknown;
  onUpvoteClick?: (post: Post) => unknown;
  onDownvoteClick?: (post: Post) => unknown;
  onCommentClick?: (post: Post) => unknown;
  onBookmarkClick?: (post: Post) => unknown;
  onShareClick?: (event: React.MouseEvent, post: Post) => unknown;
  onReadArticleClick?: (e: React.MouseEvent) => unknown;
  className?: string;
  insaneMode?: boolean;
  openNewTab?: boolean;
}

type ShareButtonProps = {
  onShareClick?: (event: React.MouseEvent, post: Post) => unknown;
  post: Post;
};
function ShareButton(props: ShareButtonProps) {
  const { onShareClick, post } = props;
  const onClickShare = (event) => onShareClick?.(event, post);
  return (
    <SimpleTooltip content="Share post">
      <Button
        className="ml-2"
        icon={<ShareIcon />}
        onClick={onClickShare}
        color={ButtonColor.Cabbage}
        variant={ButtonVariant.Float}
      />
    </SimpleTooltip>
  );
}

export default function ActionButtons({
  post,
  onUpvoteClick,
  onDownvoteClick,
  onCommentClick,
  onBookmarkClick,
  onShareClick,
  className,
}: ActionButtonsProps): ReactElement {
  const isFeedPreview = useFeedPreviewMode();

  if (isFeedPreview) {
    return null;
  }

  const shareButton = ShareButton({
    post,
    onShareClick,
  });

  return (
    <div className={classNames('flex flex-row items-center', className)}>
      <div className="flex flex-row items-center rounded-12 bg-theme-float">
        <SimpleTooltip
          content={
            post?.userState?.vote === UserPostVote.Up
              ? 'Remove upvote'
              : 'Upvote'
          }
        >
          <Button
            id={`post-${post.id}-upvote-btn`}
            color={ButtonColor.Avocado}
            icon={
              <UpvoteIcon
                secondary={post?.userState?.vote === UserPostVote.Up}
              />
            }
            pressed={post?.userState?.vote === UserPostVote.Up}
            onClick={() => onUpvoteClick?.(post)}
            variant={ButtonVariant.Tertiary}
          />
        </SimpleTooltip>
        <InteractionCounter
          className="font-bold text-theme-label-tertiary typo-callout"
          value={post.numUpvotes}
        />
        <SimpleTooltip
          content={
            post?.userState?.vote === UserPostVote.Down
              ? 'Remove downvote'
              : 'Downvote'
          }
        >
          <Button
            id={`post-${post.id}-downvote-btn`}
            color={ButtonColor.Ketchup}
            icon={
              <DownvoteIcon
                secondary={post?.userState?.vote === UserPostVote.Down}
              />
            }
            pressed={post?.userState?.vote === UserPostVote.Down}
            onClick={() => onDownvoteClick?.(post)}
            variant={ButtonVariant.Tertiary}
          />
        </SimpleTooltip>
      </div>
      <SimpleTooltip content="Comments">
        <Button
          id={`post-${post.id}-comment-btn`}
          className="ml-2"
          color={ButtonColor.BlueCheese}
          icon={<CommentIcon secondary={post.commented} />}
          pressed={post.commented}
          onClick={() => onCommentClick?.(post)}
          variant={ButtonVariant.Float}
        >
          <InteractionCounter
            className="text-theme-label-tertiary"
            value={post.numComments}
          />
        </Button>
      </SimpleTooltip>
      <SimpleTooltip content={post.bookmarked ? 'Remove bookmark' : 'Bookmark'}>
        <Button
          id={`post-${post.id}-bookmark-btn`}
          className="ml-2"
          icon={<BookmarkIcon secondary={post.bookmarked} />}
          onClick={() => onBookmarkClick(post)}
          color={ButtonColor.Bun}
          pressed={post.bookmarked}
          variant={ButtonVariant.Float}
        />
      </SimpleTooltip>
      {shareButton}
    </div>
  );
}
