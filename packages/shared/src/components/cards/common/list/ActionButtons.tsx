import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Post, UserVote } from '../../../../graphql/posts';
import InteractionCounter from '../../../InteractionCounter';
import {
  BookmarkIcon,
  DownvoteIcon,
  DiscussIcon as CommentIcon,
  LinkIcon,
} from '../../../icons';
import { Button, ButtonColor, ButtonVariant } from '../../../buttons/Button';
import { SimpleTooltip } from '../../../tooltips/SimpleTooltip';
import { useFeedPreviewMode } from '../../../../hooks';
import { combinedClicks } from '../../../../lib/click';
import { useBlockPostPanel } from '../../../../hooks/post/useBlockPostPanel';
import ConditionalWrapper from '../../../ConditionalWrapper';
import { PostTagsPanel } from '../../../post/block/PostTagsPanel';
import { IconSize } from '../../../Icon';
import { LinkWithTooltip } from '../../../tooltips/LinkWithTooltip';
import { ActionButtonsProps } from '../../ActionsButtons';
import { UpvoteButtonIcon } from '../../ActionsButtons/UpvoteButtonIcon';
import { BookmarkButton } from '../../../buttons';
import { useFeature } from '../../../GrowthBookProvider';
import {
  feedActionSpacing,
  featureUpvoteCounter,
} from '../../../../lib/featureManagement';

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
  const isFeedPreview = useFeedPreviewMode();
  const { data, onShowPanel, onClose } = useBlockPostPanel(post);
  const feedActionSpacingExp = useFeature(feedActionSpacing);
  const { showTagsPanel } = data;
  const alwaysShowUpvoteCounter = useFeature(featureUpvoteCounter);
  const isCounterVisible =
    post?.numUpvotes || alwaysShowUpvoteCounter || feedActionSpacingExp;

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

  const onToggleUpvote = () => {
    if (post.userState?.vote === UserVote.Down && !!showTagsPanel) {
      onClose(true);
    }

    onUpvoteClick?.(post);
  };

  const keepUpvoteSpace = post.numUpvotes || feedActionSpacingExp;

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
        <div className="flex flex-row items-center rounded-12 bg-surface-float">
          <SimpleTooltip
            content={
              post?.userState?.vote === UserVote.Up ? 'Remove upvote' : 'Upvote'
            }
          >
            <Button
              className={classNames(
                'pointer-events-auto',
                isCounterVisible
                  ? '!pl-1 !pr-3'
                  : !feedActionSpacingExp && 'w-8',
              )}
              id={`post-${post.id}-upvote-btn`}
              color={ButtonColor.Avocado}
              pressed={post?.userState?.vote === UserVote.Up}
              onClick={onToggleUpvote}
              variant={ButtonVariant.Tertiary}
            >
              <UpvoteButtonIcon
                secondary={post?.userState?.vote === UserVote.Up}
                size={IconSize.Medium}
              />
              {isCounterVisible ? (
                <InteractionCounter
                  className={classNames(
                    'ml-1.5 tabular-nums',
                    !post.numUpvotes && feedActionSpacingExp && 'invisible',
                  )}
                  value={post?.numUpvotes}
                />
              ) : null}
            </Button>
          </SimpleTooltip>
          {!feedActionSpacingExp && (
            <div className="box-border border border-surface-float py-2.5" />
          )}
          <SimpleTooltip
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
          </SimpleTooltip>
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
            variant={ButtonVariant.Float}
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
            icon: <BookmarkIcon secondary={post.bookmarked} />,
            onClick: () => onBookmarkClick(post),
            variant: ButtonVariant.Float,
            className: 'pointer-events-auto ml-2',
          }}
        />
        <SimpleTooltip content="Copy link">
          <Button
            className="pointer-events-auto ml-2"
            icon={<LinkIcon />}
            onClick={(e) => onCopyLinkClick?.(e, post)}
            variant={ButtonVariant.Float}
            color={ButtonColor.Cabbage}
          />
        </SimpleTooltip>
      </div>
    </ConditionalWrapper>
  );
}
