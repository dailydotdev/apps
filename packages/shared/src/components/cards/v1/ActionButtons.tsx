import React, { ReactElement } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import Link from 'next/link';
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
import { useBlockPostPanel } from '../../../hooks/post/useBlockPostPanel';
import ConditionalWrapper from '../../ConditionalWrapper';
import { PostTagsPanel } from '../../post/block/PostTagsPanel';

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
        className="pointer-events-auto ml-2"
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
  const { data, onShowPanel, onClose } = useBlockPostPanel(post);
  const { showTagsPanel } = data;

  if (isFeedPreview) {
    return null;
  }

  const shareButton = ShareButton({
    post,
    onShareClick,
  });

  const onToggleDownvote = async () => {
    if (post.userState?.vote !== UserPostVote.Down) {
      onShowPanel();
    } else {
      onClose(true);
    }

    await onDownvoteClick?.(post);
  };

  return (
    <ConditionalWrapper
      condition={showTagsPanel === true}
      wrapper={(children) => (
        <div className="flex flex-col">
          {children}
          <PostTagsPanel
            post={post}
            className="pointer-events-auto mt-4"
            toastOnSuccess={false}
          />
        </div>
      )}
    >
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
              className="pointer-events-auto"
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
          {post?.numUpvotes > 0 && (
            <InteractionCounter
              className={classNames(
                '!min-w-[2ch] font-bold tabular-nums typo-callout',
                post?.userState?.vote === UserPostVote.Up
                  ? 'text-theme-color-avocado'
                  : 'text-theme-label-tertiary',
              )}
              value={post?.numUpvotes}
            />
          )}
          <SimpleTooltip
            content={
              post?.userState?.vote === UserPostVote.Down
                ? 'Remove downvote'
                : 'Downvote'
            }
          >
            <Button
              className="pointer-events-auto"
              id={`post-${post.id}-downvote-btn`}
              color={ButtonColor.Ketchup}
              icon={
                <DownvoteIcon
                  secondary={post?.userState?.vote === UserPostVote.Down}
                />
              }
              pressed={post?.userState?.vote === UserPostVote.Down}
              onClick={onToggleDownvote}
              variant={ButtonVariant.Tertiary}
            />
          </SimpleTooltip>
        </div>
        <SimpleTooltip content="Comments">
          <Link href={post.commentsPermalink}>
            <Button
              id={`post-${post.id}-comment-btn`}
              className="pointer-events-auto ml-2 hover:text-theme-color-blueCheese"
              color={ButtonColor.BlueCheese}
              icon={<CommentIcon secondary={post.commented} />}
              tag="a"
              href={post.commentsPermalink}
              pressed={post.commented}
              variant={ButtonVariant.Float}
              {...combinedClicks(() => onCommentClick?.(post))}
            >
              {post?.numComments > 0 ? (
                <InteractionCounter
                  className={classNames(
                    'tabular-nums',
                    post.commented
                      ? 'text-theme-color-blueCheese'
                      : 'text-theme-label-tertiary',
                  )}
                  value={post.numComments}
                />
              ) : null}
            </Button>
          </Link>
        </SimpleTooltip>
        <SimpleTooltip
          content={post.bookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
          <Button
            id={`post-${post.id}-bookmark-btn`}
            className="pointer-events-auto ml-2"
            icon={<BookmarkIcon secondary={post.bookmarked} />}
            onClick={() => onBookmarkClick(post)}
            color={ButtonColor.Bun}
            pressed={post.bookmarked}
            variant={ButtonVariant.Float}
          />
        </SimpleTooltip>
        {shareButton}
      </div>
    </ConditionalWrapper>
  );
}
