import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Post, UserVote } from '../../../graphql/posts';
import InteractionCounter from '../../InteractionCounter';
import { QuaternaryButton } from '../../buttons/QuaternaryButton';
import {
  UpvoteIcon,
  DiscussIcon as CommentIcon,
  BookmarkIcon,
  LinkIcon,
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
import { useFeature } from '../../GrowthBookProvider';
import { feature } from '../../../lib/featureManagement';
import { UpvoteExperiment } from '../../../lib/featureValues';
import styles from './ActionButtons.module.css';
import { IconSize } from '../../Icon';

export interface ActionButtonsProps {
  post: Post;
  onUpvoteClick: (post: Post) => unknown;
  onCommentClick: (post: Post) => unknown;
  onBookmarkClick: (post: Post) => unknown;
  onCopyLinkClick: (event: React.MouseEvent, post: Post) => unknown;
  className?: string;
}

export default function ActionButtons({
  post,
  onUpvoteClick,
  onCommentClick,
  onBookmarkClick,
  onCopyLinkClick,
  className,
}: ActionButtonsProps): ReactElement {
  const upvoteCommentProps: ButtonProps<'button'> = {
    size: ButtonSize.Small,
  };
  const isFeedPreview = useFeedPreviewMode();

  const currentVersion = useFeature(feature.upvote);
  const isAnimatedVersion = currentVersion === UpvoteExperiment.Animated;

  if (isFeedPreview) {
    return null;
  }

  const lastActions = (
    <>
      <SimpleTooltip content={post.bookmarked ? 'Remove bookmark' : 'Bookmark'}>
        <QuaternaryButton
          id={`post-${post.id}-bookmark-btn`}
          icon={<BookmarkIcon secondary={post.bookmarked} />}
          onClick={() => onBookmarkClick(post)}
          className="btn-tertiary-bun !min-w-[4.625rem]"
          pressed={post.bookmarked}
          {...upvoteCommentProps}
        />
      </SimpleTooltip>
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

  const isUpvoteActive = post?.userState?.vote === UserVote.Up;

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
            <span className="pointer-events-none relative">
              <UpvoteIcon secondary={post?.userState?.vote === UserVote.Up} />
              {isAnimatedVersion && isUpvoteActive && <AnimatedUpvoteIcons />}
            </span>
          }
          pressed={isUpvoteActive}
          onClick={() => onUpvoteClick?.(post)}
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
}

const AnimatedUpvoteIcons = React.memo(function InnerAnimatedUpvoteIcons() {
  const arrows = Array.from({ length: 5 }, (_, i) => i + 1);
  return (
    <span
      aria-hidden
      className={classNames(
        styles.upvotes,
        'absolute left-1/2 top-0 h-full w-[125%] -translate-x-1/2',
      )}
      role="presentation"
    >
      {arrows.map((i) => (
        <UpvoteIcon
          secondary
          size={IconSize.XXSmall}
          className={styles.upvote}
          key={i}
        />
      ))}
    </span>
  );
});
