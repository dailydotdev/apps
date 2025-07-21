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
import { useCardExperimentConfig } from '../../../../hooks/useCardExperimentConfig';
import { combinedClicks } from '../../../../lib/click';

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

  const config = useCardExperimentConfig('list');

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

  const renderNewExperience = () => (
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
            labelClassName="!pl-0"
            id={`post-${post.id}-upvote-btn`}
            color={ButtonColor.Avocado}
            pressed={post?.userState?.vote === UserVote.Up}
            onClick={onToggleUpvote}
            variant={ButtonVariant.Tertiary}
            icon={
              <UpvoteButtonIcon
                secondary={post?.userState?.vote === UserVote.Up}
                size={config.iconSize}
              />
            }
          >
            {post?.numUpvotes > 0 && (
              <InteractionCounter
                className={classNames(
                  'tabular-nums',
                  !post?.numUpvotes && 'invisible',
                )}
                value={post?.numUpvotes}
              />
            )}
          </QuaternaryButton>
        </Tooltip>
        <Tooltip
          content={
            post?.userState?.vote === UserVote.Down
              ? 'Remove downvote'
              : 'Downvote'
          }
        >
          <QuaternaryButton
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
            labelClassName="!pl-0"
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
            {post?.numComments > 0 && (
              <InteractionCounter
                className={classNames(
                  'tabular-nums',
                  !post.numComments && 'invisible',
                )}
                value={post.numComments}
              />
            )}
          </QuaternaryButton>
        </LinkWithTooltip>
        {config.showAwardAction && (
          <PostAwardAction iconSize={config.iconSize} post={post} />
        )}
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
          <QuaternaryButton
            className="pointer-events-auto"
            icon={<LinkIcon />}
            onClick={onCopyLink}
            variant={ButtonVariant.Tertiary}
            color={config.copyButtonColor}
            buttonClassName={config.copyButtonClassName}
          />
        </Tooltip>
      </div>
    </ConditionalWrapper>
  );

  if (config.useNewExperience) {
    return renderNewExperience();
  }

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
      <div className={classNames('flex flex-row items-center', className)}>
        <div
          className={classNames(
            'flex flex-row items-center rounded-12',
            config.background,
          )}
        >
          <Tooltip
            content={
              post?.userState?.vote === UserVote.Up ? 'Remove upvote' : 'Upvote'
            }
          >
            <Button
              className="pointer-events-auto !pl-1 !pr-3"
              id={`post-${post.id}-upvote-btn`}
              color={ButtonColor.Avocado}
              pressed={post?.userState?.vote === UserVote.Up}
              onClick={onToggleUpvote}
              variant={ButtonVariant.Tertiary}
            >
              <UpvoteButtonIcon
                secondary={post?.userState?.vote === UserVote.Up}
                size={config.iconSize}
              />
              <InteractionCounter
                className={classNames(
                  'ml-1.5 tabular-nums',
                  !post.numUpvotes && 'invisible',
                )}
                value={post?.numUpvotes}
              />
            </Button>
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
        </div>
        <LinkWithTooltip
          tooltip={{ content: 'Comment' }}
          href={post.commentsPermalink}
        >
          <Button
            id={`post-${post.id}-comment-btn`}
            className={classNames(
              'pointer-events-auto ml-2',
              post?.numComments > 0 ? '!pl-3' : 'w-10',
            )}
            color={ButtonColor.BlueCheese}
            tag="a"
            href={post.commentsPermalink}
            pressed={post.commented}
            variant={ButtonVariant.Tertiary}
            {...combinedClicks(() => onCommentClick?.(post))}
          >
            <CommentIcon secondary={post.commented} size={IconSize.Medium} />
            {post?.numComments > 0 ? (
              <InteractionCounter
                className="-mr-0.5 ml-1.5 tabular-nums"
                value={post.numComments}
              />
            ) : null}
          </Button>
        </LinkWithTooltip>
        <BookmarkButton
          post={post}
          buttonProps={{
            id: `post-${post.id}-bookmark-btn`,
            onClick: onToggleBookmark,
            variant: ButtonVariant.Tertiary,
            className: 'pointer-events-auto ml-2',
          }}
        />
        <Tooltip content="Copy link">
          <Button
            className="pointer-events-auto ml-2"
            icon={<LinkIcon />}
            onClick={onCopyLink}
            variant={ButtonVariant.Tertiary}
            color={ButtonColor.Cabbage}
          />
        </Tooltip>
      </div>
    </ConditionalWrapper>
  );
}
