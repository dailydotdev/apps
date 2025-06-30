import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { UserVote } from '../../../graphql/posts';
import InteractionCounter from '../../InteractionCounter';
import { QuaternaryButton } from '../../buttons/QuaternaryButton';
import {
  DiscussIcon as CommentIcon,
  LinkIcon,
  DownvoteIcon,
} from '../../icons';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
import { useFeedPreviewMode } from '../../../hooks';
import { UpvoteButtonIcon } from './UpvoteButtonIcon';
import { BookmarkButton } from '../../buttons';
import { IconSize } from '../../Icon';
import { useBlockPostPanel } from '../../../hooks/post/useBlockPostPanel';
import { usePostActions } from '../../../hooks/post/usePostActions';
import { Tooltip } from '../../tooltip/Tooltip';
import PostAwardAction from '../../post/PostAwardAction';

export interface ActionButtonsProps {
  post: Post;
  onUpvoteClick: (post: Post) => unknown;
  onCommentClick: (post: Post) => unknown;
  onBookmarkClick: (post: Post) => unknown;
  onCopyLinkClick: (event: React.MouseEvent, post: Post) => unknown;
  className?: string;
  onDownvoteClick?: (post: Post) => unknown;
}

const ActionButtons = ({
  post,
  onUpvoteClick,
  onCommentClick,
  onBookmarkClick,
  onCopyLinkClick,
  className,
  onDownvoteClick,
}: ActionButtonsProps): ReactElement => {
  const { onInteract, interaction, previousInteraction } = usePostActions({
    post,
  });
  const isFeedPreview = useFeedPreviewMode();
  const isUpvoteActive = post.userState?.vote === UserVote.Up;
  const isDownvoteActive = post.userState?.vote === UserVote.Down;
  const { onShowPanel, onClose } = useBlockPostPanel(post);

  if (isFeedPreview) {
    return null;
  }

  const onToggleDownvote = async () => {
    if (post.userState?.vote !== UserVote.Down) {
      onShowPanel();
    } else {
      onInteract('none');
      onClose(true);
    }

    await onDownvoteClick?.(post);
  };

  const onToggleUpvote = async () => {
    if (post.userState?.vote !== UserVote.Up) {
      onInteract('upvote');
    }
    if (interaction === 'upvote') {
      onInteract('none');
    }
    onUpvoteClick?.(post);
  };

  const onToggleBookmark = async () => {
    if (!post.bookmarked) {
      onInteract('bookmark');
    }
    if (interaction === 'bookmark') {
      onInteract(previousInteraction);
    }
    onBookmarkClick(post);
  };

  const onCopyLink = (e: React.MouseEvent) => {
    onInteract('copy');
    onCopyLinkClick?.(e, post);
  };

  return (
    <div
      className={classNames(
        'flex flex-row items-center justify-between px-1 pb-1',
        className,
      )}
    >
      <div className="flex flex-1 items-center justify-between">
        <Tooltip content={isUpvoteActive ? 'Remove upvote' : 'Upvote'}>
          <QuaternaryButton
            labelClassName="pl-0"
            className="btn-tertiary-avocado pointer-events-auto px-0"
            id={`post-${post.id}-upvote-btn`}
            color={ButtonColor.Avocado}
            pressed={isUpvoteActive}
            onClick={onToggleUpvote}
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={
              <UpvoteButtonIcon
                secondary={isUpvoteActive}
                size={IconSize.XSmall}
              />
            }
          >
            {post?.numUpvotes > 0 && (
              <InteractionCounter
                className={classNames(
                  'tabular-nums typo-footnote',
                  !post.numUpvotes && 'invisible',
                )}
                value={post.numUpvotes}
              />
            )}
          </QuaternaryButton>
        </Tooltip>
        <Tooltip content={isDownvoteActive ? 'Remove downvote' : 'Downvote'}>
          <Button
            className="pointer-events-auto"
            id={`post-${post.id}-downvote-btn`}
            color={ButtonColor.Ketchup}
            icon={
              <DownvoteIcon
                secondary={isDownvoteActive}
                size={IconSize.XSmall}
              />
            }
            pressed={isDownvoteActive}
            onClick={onToggleDownvote}
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
          />
        </Tooltip>
        <Tooltip content="Comments">
          <QuaternaryButton
            labelClassName="pl-0"
            id={`post-${post.id}-comment-btn`}
            icon={
              <CommentIcon secondary={post.commented} size={IconSize.XSmall} />
            }
            pressed={post.commented}
            onClick={() => onCommentClick?.(post)}
            size={ButtonSize.Small}
            className="btn-tertiary-blueCheese"
          >
            {post.numComments ? (
              <InteractionCounter
                className="tabular-nums !typo-footnote"
                value={post.numComments}
              />
            ) : null}
          </QuaternaryButton>
        </Tooltip>
        <PostAwardAction post={post} />
        <BookmarkButton
          post={post}
          buttonProps={{
            id: `post-${post.id}-bookmark-btn`,
            onClick: onToggleBookmark,
            size: ButtonSize.Small,
          }}
          iconSize={IconSize.XSmall}
        />
        <Tooltip content="Copy link">
          <Button
            size={ButtonSize.Small}
            icon={<LinkIcon size={IconSize.XSmall} />}
            onClick={onCopyLink}
            variant={ButtonVariant.Tertiary}
            color={ButtonColor.Water}
          />
        </Tooltip>
      </div>
    </div>
  );
};

export default ActionButtons;
