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
import { ActionButtonsProps } from '../ActionButtons';
import { combinedClicks } from '../../../lib/click';
import Link from 'next/link';

const ShareIcon = dynamic(
  () => import(/* webpackChunkName: "shareIcon" */ '../../icons/Share'),
);

interface ShareButtonProps {
  onShareClick?: (event: React.MouseEvent, post: Post) => unknown;
  post: Post;
}

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

interface ActionButtonsPropsV1 extends ActionButtonsProps {
  onDownvoteClick?: (post: Post) => unknown;
}

export default function ActionButtons({
  post,
  onUpvoteClick,
  onDownvoteClick,
  onCommentClick,
  onBookmarkClick,
  onShareClick,
  className,
}: ActionButtonsPropsV1): ReactElement {
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
        <Link href={post.commentsPermalink}>
          <Button
            id={`post-${post.id}-comment-btn`}
            className="ml-2"
            color={ButtonColor.BlueCheese}
            icon={<CommentIcon secondary={post.commented} />}
            tag="a"
            href={post.commentsPermalink}
            pressed={post.commented}
            variant={ButtonVariant.Float}
            {...combinedClicks(() => onCommentClick?.(post))}
          >
            <InteractionCounter
              className="text-theme-label-tertiary"
              value={post.numComments}
            />
          </Button>
        </Link>
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
