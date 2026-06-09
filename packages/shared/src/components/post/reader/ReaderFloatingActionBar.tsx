import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { UserVote } from '../../../graphql/posts';
import {
  DiscussIcon as CommentIcon,
  DiscussIconV2 as CommentIconV2,
  DownvoteIcon,
  ShareIcon,
  UpvoteIcon,
} from '../../icons';
import { useFeature } from '../../GrowthBookProvider';
import { featureCommentFirstAction } from '../../../lib/featureManagement';
import { Button, ButtonVariant, ButtonColor } from '../../buttons/Button';
import { BookmarkButton } from '../../buttons';
import { useBookmarkPost } from '../../../hooks/useBookmarkPost';
import { useVotePost } from '../../../hooks/vote/useVotePost';
import { useSharePost } from '../../../hooks/useSharePost';
import { Origin } from '../../../lib/log';
import { largeNumberFormat } from '../../../lib/numberFormat';
import { Tooltip } from '../../tooltip/Tooltip';
import { IconSize } from '../../Icon';
import { useEngagementBarV2 } from '../../../hooks/useEngagementBarV2';
import { ReaderFloatingActionBar as ReaderFloatingActionBarV2 } from './ReaderFloatingActionBar.v2';

type ReaderFloatingActionBarProps = {
  post: Post;
  onCommentClick: () => void;
};

// Larger touch targets and more breathing room between actions so the
// floating bar reads as the primary "react to this post" surface.
const FLOATING_ICON_SIZE = IconSize.Medium;
const countActionButtonClasses =
  '!h-11 !min-w-0 !gap-1.5 !rounded-12 !px-3 !justify-center !font-normal';
const iconActionButtonClasses =
  '!h-11 !w-11 !min-w-11 !rounded-12 !p-0 !justify-center';
const countClasses = 'text-text-tertiary typo-callout tabular-nums';

function ReaderFloatingActionBarV1({
  post,
  onCommentClick,
}: ReaderFloatingActionBarProps): ReactElement {
  const { toggleBookmark } = useBookmarkPost();
  const { toggleUpvote, toggleDownvote } = useVotePost();
  const { openSharePost } = useSharePost(Origin.ReaderModal);
  const isCommentFirst = useFeature(featureCommentFirstAction);
  const CommentIconComponent = isCommentFirst ? CommentIconV2 : CommentIcon;

  const isUpvoteActive = post?.userState?.vote === UserVote.Up;
  const isDownvoteActive = post?.userState?.vote === UserVote.Down;
  const upvotes = largeNumberFormat(post.numUpvotes ?? 0) ?? '0';
  const comments = largeNumberFormat(post.numComments ?? 0) ?? '0';

  const commentButton = (
    <Tooltip content="Reply">
      <Button
        type="button"
        pressed={post.commented}
        onClick={onCommentClick}
        icon={
          <CommentIconComponent
            secondary={post.commented}
            size={FLOATING_ICON_SIZE}
          />
        }
        aria-label="Comment"
        variant={ButtonVariant.Tertiary}
        className={classNames(
          countActionButtonClasses,
          'btn-tertiary-blueCheese',
        )}
      >
        <span className={countClasses}>{comments}</span>
      </Button>
    </Tooltip>
  );

  return (
    <div
      className="z-20 pointer-events-auto absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-20 border border-border-subtlest-tertiary bg-background-default px-3 py-2 shadow-3"
      role="toolbar"
      aria-label="Post actions"
    >
      {isCommentFirst && commentButton}
      <Tooltip content={isUpvoteActive ? 'Remove upvote' : 'Upvote'}>
        <Button
          type="button"
          pressed={isUpvoteActive}
          onClick={() => {
            toggleUpvote({ payload: post, origin: Origin.ReaderModal }).catch(
              () => {},
            );
          }}
          icon={
            <UpvoteIcon secondary={isUpvoteActive} size={FLOATING_ICON_SIZE} />
          }
          aria-label="Upvote"
          variant={ButtonVariant.Tertiary}
          color={ButtonColor.Avocado}
          className={countActionButtonClasses}
        >
          <span className={countClasses}>{upvotes}</span>
        </Button>
      </Tooltip>
      <Tooltip content={isDownvoteActive ? 'Remove downvote' : 'Downvote'}>
        <Button
          type="button"
          pressed={isDownvoteActive}
          onClick={() => {
            toggleDownvote({ payload: post, origin: Origin.ReaderModal }).catch(
              () => {},
            );
          }}
          icon={
            <DownvoteIcon
              secondary={isDownvoteActive}
              size={FLOATING_ICON_SIZE}
            />
          }
          aria-label="Downvote"
          variant={ButtonVariant.Tertiary}
          color={ButtonColor.Ketchup}
          className={iconActionButtonClasses}
        />
      </Tooltip>
      {!isCommentFirst && commentButton}
      <BookmarkButton
        post={post}
        iconSize={FLOATING_ICON_SIZE}
        buttonProps={{
          type: 'button',
          pressed: post.bookmarked,
          onClick: () => {
            toggleBookmark({ post, origin: Origin.ReaderModal }).catch(
              () => {},
            );
          },
          className: '!h-11 !w-11 !shrink-0',
          buttonClassName: classNames(
            iconActionButtonClasses,
            'btn-tertiary-bun',
          ),
        }}
      />
      <Tooltip content="Share">
        <Button
          type="button"
          onClick={() =>
            openSharePost({
              post,
            })
          }
          icon={<ShareIcon size={FLOATING_ICON_SIZE} />}
          aria-label="Share"
          variant={ButtonVariant.Tertiary}
          className={iconActionButtonClasses}
        />
      </Tooltip>
    </div>
  );
}

export function ReaderFloatingActionBar(
  props: ReaderFloatingActionBarProps,
): ReactElement {
  const useV2 = useEngagementBarV2();
  if (useV2) {
    return <ReaderFloatingActionBarV2 {...props} />;
  }
  return <ReaderFloatingActionBarV1 {...props} />;
}
