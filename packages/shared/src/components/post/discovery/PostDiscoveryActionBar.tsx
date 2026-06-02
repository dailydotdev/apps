import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { UserVote } from '../../../graphql/posts';
import { useVotePost } from '../../../hooks';
import { useBookmarkPost } from '../../../hooks/useBookmarkPost';
import { useBlockPostPanel } from '../../../hooks/post/useBlockPostPanel';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { PostOrigin } from '../../../hooks/log/useLogContextData';
import { Origin } from '../../../lib/log';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
import { QuaternaryButton } from '../../buttons/QuaternaryButton';
import { BookmarkButton } from '../../buttons/BookmarkButton';
import { UpvoteButtonIcon } from '../../cards/common/UpvoteButtonIcon';
import {
  AnalyticsIcon,
  DiscussIcon as CommentIcon,
  DownvoteIcon,
  LinkIcon,
} from '../../icons';
import { Tooltip } from '../../tooltip/Tooltip';
import Link from '../../utilities/Link';
import { largeNumberFormat } from '../../../lib';
import { canViewPostAnalytics } from '../../../lib/user';
import { webappUrl } from '../../../lib/constants';
import { PostMenuOptions } from '../PostMenuOptions';
import { PostClickbaitShield } from '../common/PostClickbaitShield';

interface PostDiscoveryActionBarProps {
  post: Post;
  origin?: PostOrigin;
  onComment?: () => void;
  onCopyLinkClick?: (post?: Post) => void;
  className?: string;
}

/**
 * Compact, border-framed engagement bar for the discovery focus card. Left side
 * surfaces the vote/comment actions with their engagement counts; right side
 * keeps icon-only utilities (bookmark, copy, analytics, menu, clickbait shield).
 * The comment sort lives in the discussion panel header, not here.
 */
export const PostDiscoveryActionBar = ({
  post,
  origin = Origin.ArticlePage,
  onComment,
  onCopyLinkClick,
  className,
}: PostDiscoveryActionBarProps): ReactElement => {
  const { user } = useAuthContext();
  const { toggleUpvote, toggleDownvote } = useVotePost();
  const { toggleBookmark } = useBookmarkPost();
  const { onShowPanel, onClose } = useBlockPostPanel(post);

  const isUpvoteActive = post?.userState?.vote === UserVote.Up;
  const isDownvoteActive = post?.userState?.vote === UserVote.Down;
  const upvotes = post.numUpvotes || 0;
  const comments = post.numComments || 0;
  const canSeeAnalytics = canViewPostAnalytics({ user, post });

  const onToggleUpvote = async () => {
    if (post?.userState?.vote === UserVote.None) {
      onClose(true);
    }
    await toggleUpvote({ payload: post, origin });
  };

  const onToggleDownvote = async () => {
    if (post.userState?.vote !== UserVote.Down) {
      onShowPanel();
    } else {
      onClose(true);
    }
    await toggleDownvote({ payload: post, origin });
  };

  const onToggleBookmark = async () => {
    await toggleBookmark({ post, origin });
  };

  return (
    <div
      className={classNames(
        'flex items-center justify-between gap-2 border-y border-border-subtlest-tertiary py-1',
        className,
      )}
    >
      <div className="flex items-center gap-0.5">
        <Tooltip content={isUpvoteActive ? 'Remove upvote' : 'More like this'}>
          <QuaternaryButton
            id="upvote-post-btn"
            aria-label="Upvote"
            color={ButtonColor.Avocado}
            icon={<UpvoteButtonIcon secondary={isUpvoteActive} />}
            onClick={onToggleUpvote}
            pressed={isUpvoteActive}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
          >
            {upvotes > 0 ? largeNumberFormat(upvotes) : undefined}
          </QuaternaryButton>
        </Tooltip>
        <Tooltip
          content={isDownvoteActive ? 'Remove downvote' : 'Less like this'}
        >
          <QuaternaryButton
            id="downvote-post-btn"
            aria-label="Downvote"
            color={ButtonColor.Ketchup}
            icon={<DownvoteIcon secondary={isDownvoteActive} />}
            onClick={onToggleDownvote}
            pressed={isDownvoteActive}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
          />
        </Tooltip>
        <Tooltip content="Comment">
          <QuaternaryButton
            id="comment-post-btn"
            aria-label="Comment"
            color={ButtonColor.BlueCheese}
            icon={<CommentIcon secondary={post.commented} />}
            onClick={onComment}
            pressed={post.commented}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
          >
            {comments > 0 ? largeNumberFormat(comments) : undefined}
          </QuaternaryButton>
        </Tooltip>
      </div>

      <div className="flex items-center gap-0.5">
        <BookmarkButton
          post={post}
          buttonProps={{
            id: 'bookmark-post-btn',
            pressed: post.bookmarked,
            onClick: onToggleBookmark,
            size: ButtonSize.Small,
          }}
        />
        <Tooltip content="Copy link">
          <Button
            aria-label="Copy link"
            color={ButtonColor.Cabbage}
            icon={<LinkIcon />}
            onClick={() => onCopyLinkClick?.(post)}
            size={ButtonSize.Small}
            type="button"
            variant={ButtonVariant.Tertiary}
          />
        </Tooltip>
        {canSeeAnalytics && (
          <Tooltip content="Analytics">
            <Link
              href={`${webappUrl}posts/${post.id}/analytics`}
              passHref
              prefetch={false}
            >
              <Button
                aria-label="Analytics"
                icon={<AnalyticsIcon />}
                size={ButtonSize.Small}
                tag="a"
                variant={ButtonVariant.Tertiary}
              />
            </Link>
          </Tooltip>
        )}
        <PostMenuOptions
          post={post}
          origin={Origin.ArticleModal}
          buttonSize={ButtonSize.Small}
        />
        {post.clickbaitTitleDetected && (
          <div className="flex items-center [&_.mr-2]:!mr-0 [&_.mt-4]:!mt-0 [&_.mt-6]:!mt-0">
            <PostClickbaitShield post={post} />
          </div>
        )}
      </div>
    </div>
  );
};
