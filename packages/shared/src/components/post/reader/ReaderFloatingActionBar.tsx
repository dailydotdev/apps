import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { UserVote } from '../../../graphql/posts';
import {
  DiscussIcon as CommentIcon,
  DownvoteIcon,
  ShareIcon,
  UpvoteIcon,
} from '../../icons';
import { Button, ButtonVariant, ButtonColor } from '../../buttons/Button';
import { BookmarkButton } from '../../buttons';
import { useBookmarkPost } from '../../../hooks/useBookmarkPost';
import { useVotePost } from '../../../hooks/vote/useVotePost';
import { useSharePost } from '../../../hooks/useSharePost';
import { Origin } from '../../../lib/log';
import { largeNumberFormat } from '../../../lib/numberFormat';
import { Tooltip } from '../../tooltip/Tooltip';
import { IconSize } from '../../Icon';

type ReaderFloatingActionBarProps = {
  post: Post;
  onCommentClick: () => void;
};

const FLOATING_ICON_SIZE = IconSize.XSmall;
const countActionButtonClasses =
  '!h-8 !min-w-0 !gap-1 !rounded-10 !px-2 !justify-center !font-normal';
const iconActionButtonClasses =
  '!h-8 !w-8 !min-w-8 !rounded-10 !p-0 !justify-center';
const countClasses = 'text-text-tertiary typo-footnote tabular-nums';

export function ReaderFloatingActionBar({
  post,
  onCommentClick,
}: ReaderFloatingActionBarProps): ReactElement {
  const { toggleBookmark } = useBookmarkPost();
  const { toggleUpvote, toggleDownvote } = useVotePost();
  const { openSharePost } = useSharePost(Origin.ReaderModal);

  const isUpvoteActive = post?.userState?.vote === UserVote.Up;
  const isDownvoteActive = post?.userState?.vote === UserVote.Down;
  const upvotes = largeNumberFormat(post.numUpvotes ?? 0) ?? '0';
  const comments = largeNumberFormat(post.numComments ?? 0) ?? '0';

  return (
    <div
      className="z-20 pointer-events-auto absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-16 border border-border-subtlest-tertiary bg-background-default p-0.5 shadow-3"
      role="toolbar"
      aria-label="Post actions"
    >
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
      <Tooltip content="Comment">
        <Button
          type="button"
          pressed={post.commented}
          onClick={onCommentClick}
          icon={
            <CommentIcon secondary={post.commented} size={FLOATING_ICON_SIZE} />
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
          className: '!h-8 !w-8 !shrink-0',
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
