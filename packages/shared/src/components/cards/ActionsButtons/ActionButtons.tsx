import classNames from 'classnames';
import React, { ReactElement } from 'react';

import { Post, UserVote } from '../../../graphql/posts';
import { useFeedPreviewMode } from '../../../hooks';
import { useBlockPostPanel } from '../../../hooks/post/useBlockPostPanel';
import { BookmarkButton } from '../../buttons';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
import { QuaternaryButton } from '../../buttons/QuaternaryButton';
import { IconSize } from '../../Icon';
import {
  BookmarkIcon,
  DiscussIcon as CommentIcon,
  DownvoteIcon,
  LinkIcon,
} from '../../icons';
import InteractionCounter from '../../InteractionCounter';
import { SimpleTooltip } from '../../tooltips/SimpleTooltip';
import { UpvoteButtonIcon } from './UpvoteButtonIcon';

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
      onClose(true);
    }

    await onDownvoteClick?.(post);
  };

  const lastActions = (
    <>
      <BookmarkButton
        post={post}
        buttonProps={{
          id: `post-${post.id}-bookmark-btn`,
          icon: <BookmarkIcon secondary={post.bookmarked} />,
          onClick: () => onBookmarkClick(post),
          size: ButtonSize.Small,
        }}
      />
      <SimpleTooltip content="Copy link">
        <Button
          size={ButtonSize.Small}
          icon={<LinkIcon />}
          onClick={(e) => onCopyLinkClick?.(e, post)}
          variant={ButtonVariant.Tertiary}
          color={ButtonColor.Cabbage}
        />
      </SimpleTooltip>
    </>
  );

  return (
    <div
      className={classNames(
        'flex flex-row items-center justify-between',
        className,
      )}
    >
      <div className="flex flex-row items-center rounded-12 bg-surface-float">
        <SimpleTooltip content={isUpvoteActive ? 'Remove upvote' : 'Upvote'}>
          <Button
            className={classNames(
              'pointer-events-auto',
              post.numUpvotes ? '!pl-1 !pr-3' : '!px-1',
            )}
            id={`post-${post.id}-upvote-btn`}
            color={ButtonColor.Avocado}
            pressed={isUpvoteActive}
            onClick={() => {
              onUpvoteClick?.(post);
            }}
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
          >
            <UpvoteButtonIcon
              secondary={isUpvoteActive}
              size={IconSize.Small}
            />
            {post.numUpvotes ? (
              <InteractionCounter
                className="ml-1.5 tabular-nums"
                value={post.numUpvotes}
              />
            ) : null}
          </Button>
        </SimpleTooltip>
        <div className="box-border border border-surface-float py-2.5" />
        <SimpleTooltip
          content={isDownvoteActive ? 'Remove downvote' : 'Downvote'}
        >
          <Button
            className="pointer-events-auto"
            id={`post-${post.id}-downvote-btn`}
            color={ButtonColor.Ketchup}
            icon={<DownvoteIcon secondary={isDownvoteActive} />}
            pressed={isDownvoteActive}
            onClick={onToggleDownvote}
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
          />
        </SimpleTooltip>
      </div>
      <SimpleTooltip content="Comments">
        <QuaternaryButton
          id={`post-${post.id}-comment-btn`}
          icon={<CommentIcon secondary={post.commented} />}
          pressed={post.commented}
          onClick={() => onCommentClick?.(post)}
          size={ButtonSize.Small}
          className="btn-tertiary-blueCheese"
          labelClassName="!pr-0"
        >
          {post.numComments ? (
            <InteractionCounter value={post.numComments} />
          ) : null}
        </QuaternaryButton>
      </SimpleTooltip>
      {lastActions}
    </div>
  );
};

export default ActionButtons;
