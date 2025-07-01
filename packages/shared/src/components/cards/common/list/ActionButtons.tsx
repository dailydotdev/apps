import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../../graphql/posts';
import { UserVote } from '../../../../graphql/posts';
import InteractionCounter from '../../../InteractionCounter';
import {
  DownvoteIcon,
  DiscussIcon as CommentIcon,
  LinkIcon,
} from '../../../icons';
import { Button, ButtonColor, ButtonVariant } from '../../../buttons/Button';
import {
  useFeedPreviewMode,
  usePostActions,
  useBlockPostPanel,
} from '../../../../hooks';
import ConditionalWrapper from '../../../ConditionalWrapper';
import { PostTagsPanel } from '../../../post/block/PostTagsPanel';
import { IconSize } from '../../../Icon';
import { LinkWithTooltip } from '../../../tooltips/LinkWithTooltip';
import type { ActionButtonsProps } from '../../ActionsButtons';
import { UpvoteButtonIcon } from '../../ActionsButtons/UpvoteButtonIcon';
import { BookmarkButton } from '../../../buttons';
import { Tooltip } from '../../../tooltip/Tooltip';
import { QuaternaryButton } from '../../../buttons/QuaternaryButton';
import PostAwardAction from '../../../post/PostAwardAction';

interface ActionButtonsPropsList extends ActionButtonsProps {
  onDownvoteClick?: (post: Post) => unknown;
}

export default function ActionButtons({
  post,
  onUpvoteClick,
  onDownvoteClick,
  onCommentClick,
  onBookmarkClick,
  onCopyLinkClick,
  className,
}: ActionButtonsPropsList): ReactElement {
  const { onInteract, interaction, previousInteraction } = usePostActions({
    post,
  });
  const isFeedPreview = useFeedPreviewMode();
  const { data, onShowPanel, onClose } = useBlockPostPanel(post);
  const { showTagsPanel } = data;

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

  const onToggleUpvote = () => {
    if (post.userState?.vote === UserVote.Down && !!showTagsPanel) {
      onClose(true);
    }

    if (post.userState?.vote !== UserVote.Up) {
      onInteract('upvote');
    }
    if (interaction === 'upvote') {
      onInteract('none');
    }

    onUpvoteClick?.(post);
  };

  const onToggleBookmark = () => {
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
    <ConditionalWrapper
      condition={showTagsPanel === true}
      wrapper={(children) => (
        <div className="flex flex-col">
          {children}
          <PostTagsPanel post={post} className="pointer-events-auto mt-4" />
        </div>
      )}
    >
      <div
        className={classNames(
          'flex flex-row items-center justify-between',
          className,
        )}
      >
        <Tooltip
          content={
            post?.userState?.vote === UserVote.Up ? 'Remove upvote' : 'Upvote'
          }
        >
          <QuaternaryButton
            className="btn-tertiary-avocado pointer-events-auto"
            labelClassName="pl-0"
            id={`post-${post.id}-upvote-btn`}
            color={ButtonColor.Avocado}
            pressed={post?.userState?.vote === UserVote.Up}
            onClick={onToggleUpvote}
            variant={ButtonVariant.Tertiary}
            icon={
              <UpvoteButtonIcon
                secondary={post?.userState?.vote === UserVote.Up}
                size={IconSize.Medium}
              />
            }
          >
            {post?.numUpvotes ? (
              <InteractionCounter
                className="tabular-nums"
                value={post?.numUpvotes}
              />
            ) : null}
          </QuaternaryButton>
        </Tooltip>
        <Tooltip
          content={
            post?.userState?.vote === UserVote.Down
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
                secondary={post?.userState?.vote === UserVote.Down}
              />
            }
            pressed={post?.userState?.vote === UserVote.Down}
            onClick={onToggleDownvote}
            variant={ButtonVariant.Tertiary}
          />
        </Tooltip>
        <LinkWithTooltip
          tooltip={{ content: 'Comment' }}
          href={post.commentsPermalink}
        >
          <QuaternaryButton
            labelClassName="pl-0"
            id={`post-${post.id}-comment-btn`}
            className="btn-tertiary-blueCheese pointer-events-auto"
            color={ButtonColor.BlueCheese}
            tag="a"
            href={post.commentsPermalink}
            pressed={post.commented}
            variant={ButtonVariant.Tertiary}
            icon={
              <CommentIcon secondary={post.commented} size={IconSize.Medium} />
            }
            onClick={() => onCommentClick?.(post)}
          >
            {post?.numComments > 0 ? (
              <InteractionCounter
                className="tabular-nums"
                value={post.numComments}
              />
            ) : null}
          </QuaternaryButton>
        </LinkWithTooltip>
        <PostAwardAction post={post} />
        <BookmarkButton
          post={post}
          buttonProps={{
            id: `post-${post.id}-bookmark-btn`,
            onClick: onToggleBookmark,
            variant: ButtonVariant.Tertiary,
            className: 'pointer-events-auto',
          }}
        />
        <Tooltip content="Copy link">
          <Button
            className="pointer-events-auto"
            icon={<LinkIcon />}
            onClick={onCopyLink}
            variant={ButtonVariant.Tertiary}
            color={ButtonColor.Water}
          />
        </Tooltip>
      </div>
    </ConditionalWrapper>
  );
}
