import React, { ReactElement, useState } from 'react';
import classNames from 'classnames';
import { Post, UserVote } from '../../../graphql/posts';
import InteractionCounter from '../../InteractionCounter';
import { QuaternaryButton } from '../../buttons/QuaternaryButton';
import {
  DiscussIcon as CommentIcon,
  BookmarkIcon,
  LinkIcon,
  DownvoteIcon,
} from '../../icons';
import {
  Button,
  ButtonColor,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
import { SimpleTooltip } from '../../tooltips/SimpleTooltip';
import { useFeedPreviewMode } from '../../../hooks';
import { UpvoteButtonIcon } from './UpvoteButtonIcon';
import { BookmarkButton } from '../../buttons';
import { feature } from '../../../lib/featureManagement';
import { withExperiment } from '../../withExperiment';
import { IconSize } from '../../Icon';
import { useBlockPostPanel } from '../../../hooks/post/useBlockPostPanel';

export interface ActionButtonsProps {
  post: Post;
  onUpvoteClick: (post: Post) => unknown;
  onCommentClick: (post: Post) => unknown;
  onBookmarkClick: (post: Post) => unknown;
  onCopyLinkClick: (event: React.MouseEvent, post: Post) => unknown;
  className?: string;
  onDownvoteClick?: (post: Post) => unknown;
}

const ActionButtonsControl = ({
  post,
  onUpvoteClick,
  onCommentClick,
  onBookmarkClick,
  onCopyLinkClick,
  className,
}: ActionButtonsProps): ReactElement => {
  const upvoteCommentProps: ButtonProps<'button'> = {
    size: ButtonSize.Small,
  };
  const isFeedPreview = useFeedPreviewMode();
  const isUpvoteActive = post?.userState?.vote === UserVote.Up;
  const [userUpvoted, setUserUpvoted] = useState(false);

  if (isFeedPreview) {
    return null;
  }

  const lastActions = (
    <>
      <BookmarkButton
        post={post}
        buttonProps={{
          id: `post-${post.id}-bookmark-btn`,
          icon: <BookmarkIcon secondary={post.bookmarked} />,
          onClick: () => onBookmarkClick(post),
          className: '!min-w-[4.625rem]',
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
      <SimpleTooltip
        content={
          post?.userState?.vote === UserVote.Up ? 'Remove upvote' : 'Upvote'
        }
      >
        <QuaternaryButton
          id={`post-${post.id}-upvote-btn`}
          icon={
            <UpvoteButtonIcon
              secondary={post?.userState?.vote === UserVote.Up}
              userClicked={userUpvoted}
            />
          }
          pressed={isUpvoteActive}
          onClick={() => {
            onUpvoteClick?.(post);
            setUserUpvoted(true);
          }}
          {...upvoteCommentProps}
          className="btn-tertiary-avocado !min-w-[4.625rem]"
        >
          <InteractionCounter value={post.numUpvotes > 0 && post.numUpvotes} />
        </QuaternaryButton>
      </SimpleTooltip>
      <SimpleTooltip content="Comments">
        <QuaternaryButton
          id={`post-${post.id}-comment-btn`}
          icon={<CommentIcon secondary={post.commented} />}
          pressed={post.commented}
          onClick={() => onCommentClick?.(post)}
          {...upvoteCommentProps}
          className="btn-tertiary-blueCheese !min-w-[4.625rem]"
        >
          <InteractionCounter
            value={post.numComments > 0 && post.numComments}
          />
        </QuaternaryButton>
      </SimpleTooltip>
      {lastActions}
    </div>
  );
};

const ActionButtonsDownvote: typeof ActionButtonsControl = ({
  post,
  onUpvoteClick,
  onCommentClick,
  onBookmarkClick,
  onCopyLinkClick,
  className,
  onDownvoteClick,
}) => {
  const isFeedPreview = useFeedPreviewMode();
  const isUpvoteActive = post.userState?.vote === UserVote.Up;
  const isDownvoteActive = post.userState?.vote === UserVote.Down;
  const [userUpvoted, setUserUpvoted] = useState(false);
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
              setUserUpvoted(true);
            }}
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
          >
            <UpvoteButtonIcon
              secondary={isUpvoteActive}
              userClicked={userUpvoted}
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

const ActionButtons = withExperiment(ActionButtonsDownvote, {
  feature: feature.cardDownvote,
  value: true,
  fallback: ActionButtonsControl,
});

export default ActionButtons;
