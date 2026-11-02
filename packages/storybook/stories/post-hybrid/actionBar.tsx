import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { UserVote } from '@dailydotdev/shared/src/graphql/posts';
import { useVotePost } from '@dailydotdev/shared/src/hooks/vote/useVotePost';
import { useBookmarkPost } from '@dailydotdev/shared/src/hooks/useBookmarkPost';
import { usePostActions } from '@dailydotdev/shared/src/hooks/post/usePostActions';
import { useBlockPostPanel } from '@dailydotdev/shared/src/hooks/post/useBlockPostPanel';
import { useCanAwardUser } from '@dailydotdev/shared/src/hooks/useCoresFeature';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import type { PostOrigin } from '@dailydotdev/shared/src/hooks/log/useLogContextData';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { ButtonSize } from '@dailydotdev/shared/src/components/buttons/Button';
import { ButtonColor } from '@dailydotdev/shared/src/components/buttons/ButtonV2';
import { CardAction } from '@dailydotdev/shared/src/components/buttons/CardAction';
import { BookmarkButton } from '@dailydotdev/shared/src/components/buttons/BookmarkButton';
import { UpvoteButtonIcon } from '@dailydotdev/shared/src/components/cards/common/UpvoteButtonIcon';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  DiscussIcon as CommentIcon,
  DownvoteIcon,
  LinkIcon,
  MedalBadgeIcon,
} from '@dailydotdev/shared/src/components/icons';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';

interface ActionBarProps {
  post: Post;
  origin?: PostOrigin;
  onComment?: () => void;
  onCopyLinkClick?: (post?: Post) => void;
  className?: string;
}

/**
 * The redesign's engagement bar (FocusCardActionBar before #6882), as it
 * shipped: one floating pill, pinned to the bottom of the screen from tablet
 * up while the reader is inside the main column.
 */
export const ActionBar = ({
  post,
  origin = Origin.ArticlePage,
  onComment,
  onCopyLinkClick,
  className,
}: ActionBarProps): ReactElement => {
  const { user, showLogin } = useAuthContext();
  const { toggleUpvote, toggleDownvote } = useVotePost();
  const { onInteract } = usePostActions({ post });
  const { toggleBookmark } = useBookmarkPost();
  const { onShowPanel, onClose: onCloseBlockPanel } = useBlockPostPanel(post);
  const { openModal } = useLazyModal();
  const canAward = useCanAwardUser({
    sendingUser: user,
    receivingUser: post.author as LoggedUser | undefined,
  });

  const isUpvoteActive = post?.userState?.vote === UserVote.Up;
  const isDownvoteActive = post?.userState?.vote === UserVote.Down;
  const isAwarded = !!post?.userState?.awarded;

  const onToggleUpvote = async () => {
    if (post?.userState?.vote === UserVote.None) {
      onCloseBlockPanel(true);
    }
    if (post?.userState?.vote !== UserVote.Up) {
      onInteract('upvote');
    }

    await toggleUpvote({ payload: post, origin });
  };

  const onToggleDownvote = async () => {
    if (post.userState?.vote !== UserVote.Down) {
      onShowPanel();
    } else {
      onCloseBlockPanel(true);
    }
    await toggleDownvote({ payload: post, origin });
  };

  const onGiveAward = () => {
    if (!user) {
      showLogin({ trigger: AuthTriggers.GiveAward });
      return;
    }
    if (!post.author || isAwarded) {
      return;
    }
    openModal({
      type: LazyModal.GiveAward,
      props: {
        type: 'POST',
        entity: {
          id: post.id,
          receiver: post.author,
          numAwards: post.numAwards,
        },
        post,
      },
    });
  };

  return (
    <div
      className={classNames(
        'relative z-3 flex w-full items-center justify-between gap-2 rounded-16 border border-border-subtlest-tertiary bg-surface-float px-2 py-1 shadow-[0_0.25rem_1.5rem_0_var(--theme-shadow-shadow1)] backdrop-blur-[2.5rem] tablet:sticky tablet:bottom-4',
        className,
      )}
    >
      <div className="flex items-center gap-1">
        <Tooltip content={isUpvoteActive ? 'Remove upvote' : 'Upvote'}>
          <CardAction
            id="upvote-post-btn"
            label="Upvote"
            color={ButtonColor.Avocado}
            icon={<UpvoteButtonIcon />}
            iconPressed={<UpvoteButtonIcon secondary />}
            pressed={isUpvoteActive}
            onClick={onToggleUpvote}
          />
        </Tooltip>
        <Tooltip content={isDownvoteActive ? 'Remove downvote' : 'Downvote'}>
          <CardAction
            id="downvote-post-btn"
            label="Downvote"
            color={ButtonColor.Ketchup}
            icon={<DownvoteIcon />}
            iconPressed={<DownvoteIcon secondary />}
            pressed={isDownvoteActive}
            onClick={onToggleDownvote}
          />
        </Tooltip>
        <Tooltip content="Comment">
          <CardAction
            id="comment-post-btn"
            label="Comment"
            color={ButtonColor.BlueCheese}
            icon={<CommentIcon />}
            iconPressed={<CommentIcon secondary />}
            pressed={post.commented}
            onClick={onComment}
          />
        </Tooltip>
        {canAward && (
          <Tooltip
            content={isAwarded ? 'You already awarded this post!' : 'Award'}
          >
            <CardAction
              id="award-post-btn"
              label="Award"
              color={ButtonColor.Cabbage}
              icon={<MedalBadgeIcon secondary />}
              iconPressed={<MedalBadgeIcon />}
              pressed={isAwarded}
              onClick={onGiveAward}
            />
          </Tooltip>
        )}
      </div>

      <div className="flex items-center gap-1">
        <BookmarkButton
          post={post}
          iconSize={IconSize.Small}
          buttonProps={{
            id: 'bookmark-post-btn',
            pressed: post.bookmarked,
            onClick: () => toggleBookmark({ post, origin }),
            size: ButtonSize.Medium,
          }}
        />
        <div className="hidden tablet:flex">
          <Tooltip content="Copy link">
            <CardAction
              label="Copy link"
              color={ButtonColor.Cabbage}
              icon={<LinkIcon />}
              onClick={() => onCopyLinkClick?.(post)}
            />
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
