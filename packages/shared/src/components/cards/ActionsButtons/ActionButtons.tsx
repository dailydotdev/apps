import React, { ReactElement } from 'react';
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
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
import { SimpleTooltip } from '../../tooltips/SimpleTooltip';
import { useFeedPreviewMode } from '../../../hooks';
import { UpvoteButtonIcon } from './UpvoteButtonIcon';
import { BookmarkButton } from '../../buttons';
import { IconSize } from '../../Icon';
import { useBlockPostPanel } from '../../../hooks/post/useBlockPostPanel';
import { useFeature } from '../../GrowthBookProvider';
import { feedActionSpacing } from '../../../lib/featureManagement';

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
  const feedActionSpacingExp = useFeature(feedActionSpacing);

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

  const keepUpvoteSpace = post.numUpvotes || feedActionSpacingExp;

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
              keepUpvoteSpace ? '!pl-1 !pr-3' : !feedActionSpacingExp && 'w-8',
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
            {keepUpvoteSpace ? (
              <InteractionCounter
                className={classNames(
                  'ml-1.5 tabular-nums',
                  !post.numUpvotes && feedActionSpacingExp && 'invisible',
                )}
                value={post.numUpvotes}
              />
            ) : null}
          </Button>
        </SimpleTooltip>
        {!feedActionSpacingExp && (
          <div className="box-border border border-surface-float py-2.5" />
        )}
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
    </div>
  );
};

export default ActionButtons;
