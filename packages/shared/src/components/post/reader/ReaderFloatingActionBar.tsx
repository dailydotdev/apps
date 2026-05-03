import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../../graphql/posts';
import { UserVote } from '../../../graphql/posts';
import {
  DiscussIcon as CommentIcon,
  DownvoteIcon,
  ShareIcon,
  UpvoteIcon,
} from '../../icons';
import { ButtonColor } from '../../buttons/ButtonV2';
import { CardAction } from '../../buttons/CardAction';
import { CardActionBar } from '../../buttons/CardActionBar';
import { BookmarkButton } from '../../buttons';
import { useBookmarkPost } from '../../../hooks/useBookmarkPost';
import { useVotePost } from '../../../hooks/vote/useVotePost';
import { useSharePost } from '../../../hooks/useSharePost';
import { Origin } from '../../../lib/log';
import { Tooltip } from '../../tooltip/Tooltip';

type ReaderFloatingActionBarProps = {
  post: Post;
  onCommentClick: () => void;
};

export function ReaderFloatingActionBar({
  post,
  onCommentClick,
}: ReaderFloatingActionBarProps): ReactElement {
  const { toggleBookmark } = useBookmarkPost();
  const { toggleUpvote, toggleDownvote } = useVotePost();
  const { openSharePost } = useSharePost(Origin.ReaderModal);

  const isUpvoteActive = post?.userState?.vote === UserVote.Up;
  const isDownvoteActive = post?.userState?.vote === UserVote.Down;
  const upvoteCount = post.numUpvotes ?? 0;
  const commentCount = post.numComments ?? 0;

  // Floating reader bar uses `density="compact"` so the chrome stays
  // visually proportional to the small (32 px) icon ladder it shipped
  // with under v1. The wrapper keeps the bar centered, blurred, and
  // shadowed; CardActionBar `default` provides the gap-1 between
  // children that v1 achieved with `gap-0.5`.
  return (
    <div
      className="z-20 pointer-events-auto absolute bottom-4 left-1/2 -translate-x-1/2 rounded-16 border border-border-subtlest-tertiary bg-background-default p-0.5 shadow-3"
      role="toolbar"
      aria-label="Post actions"
    >
      <CardActionBar layout="default">
        <Tooltip content={isUpvoteActive ? 'Remove upvote' : 'Upvote'}>
          <CardAction
            density="compact"
            pressed={isUpvoteActive}
            onClick={() => {
              toggleUpvote({
                payload: post,
                origin: Origin.ReaderModal,
              }).catch(() => {});
            }}
            icon={<UpvoteIcon />}
            iconPressed={<UpvoteIcon secondary />}
            label="Upvote"
            count={upvoteCount}
            color={ButtonColor.Avocado}
          />
        </Tooltip>
        <Tooltip content={isDownvoteActive ? 'Remove downvote' : 'Downvote'}>
          <CardAction
            density="compact"
            pressed={isDownvoteActive}
            onClick={() => {
              toggleDownvote({
                payload: post,
                origin: Origin.ReaderModal,
              }).catch(() => {});
            }}
            icon={<DownvoteIcon />}
            iconPressed={<DownvoteIcon secondary />}
            label="Downvote"
            color={ButtonColor.Ketchup}
          />
        </Tooltip>
        <Tooltip content="Comment">
          <CardAction
            density="compact"
            pressed={post.commented}
            onClick={onCommentClick}
            icon={<CommentIcon />}
            iconPressed={<CommentIcon secondary />}
            label="Comment"
            count={commentCount}
            color={ButtonColor.BlueCheese}
          />
        </Tooltip>
        <BookmarkButton
          post={post}
          density="compact"
          pressed={post.bookmarked}
          onClick={() => {
            toggleBookmark({ post, origin: Origin.ReaderModal }).catch(
              () => {},
            );
          }}
        />
        <Tooltip content="Share">
          <CardAction
            density="compact"
            onClick={() =>
              openSharePost({
                post,
              })
            }
            icon={<ShareIcon />}
            label="Share"
          />
        </Tooltip>
      </CardActionBar>
    </div>
  );
}
