import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { UserVote } from '../../../graphql/posts';
import {
  DiscussIcon as CommentIcon,
  DownvoteIcon,
  LinkIcon,
  MedalBadgeIcon,
  UpvoteIcon,
} from '../../icons';
import { ButtonColor } from '../../buttons/ButtonV2';
import { CardAction } from '../../buttons/CardAction';
import { CardActionBar } from '../../buttons/CardActionBar';
import { BookmarkButton } from '../../buttons';
import { useBookmarkPost } from '../../../hooks/useBookmarkPost';
import { useVotePost } from '../../../hooks/vote/useVotePost';
import { useSharePost } from '../../../hooks/useSharePost';
import { AuthTriggers } from '../../../lib/auth';
import { Origin } from '../../../lib/log';
import { Tooltip } from '../../tooltip/Tooltip';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../modals/common/types';
import { useCanAwardUser } from '../../../hooks/useCoresFeature';
import type { LoggedUser } from '../../../lib/user';
import ConditionalWrapper from '../../ConditionalWrapper';

type ReaderRailActionBarProps = {
  post: Post;
  onCommentClick: () => void;
  className?: string;
};

export function ReaderRailActionBar({
  post,
  onCommentClick,
  className,
}: ReaderRailActionBarProps): ReactElement {
  const { user, showLogin } = useAuthContext();
  const { openModal } = useLazyModal();
  const { toggleBookmark } = useBookmarkPost();
  const { toggleUpvote, toggleDownvote } = useVotePost();
  const { copyLink } = useSharePost(Origin.ReaderModal);
  const canAward = useCanAwardUser({
    sendingUser: user,
    receivingUser: post.author as LoggedUser | undefined,
  });

  const isUpvoteActive = post?.userState?.vote === UserVote.Up;
  const isDownvoteActive = post?.userState?.vote === UserVote.Down;
  const isAwarded = !!post?.userState?.awarded;

  return (
    <CardActionBar
      layout="between"
      className={className}
      role="toolbar"
      aria-label="Post actions"
    >
      <Tooltip content={isUpvoteActive ? 'Remove upvote' : 'More like this'}>
        <CardAction
          id="reader-upvote-btn"
          pressed={isUpvoteActive}
          onClick={() => {
            toggleUpvote({ payload: post, origin: Origin.ReaderModal }).catch(
              () => {},
            );
          }}
          icon={<UpvoteIcon />}
          iconPressed={<UpvoteIcon secondary />}
          label="Upvote"
          color={ButtonColor.Avocado}
        />
      </Tooltip>
      <Tooltip
        content={isDownvoteActive ? 'Remove downvote' : 'Less like this'}
      >
        <CardAction
          id="reader-downvote-btn"
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
          id="reader-comment-btn"
          pressed={post.commented}
          onClick={onCommentClick}
          icon={<CommentIcon />}
          iconPressed={<CommentIcon secondary />}
          label="Comment"
          color={ButtonColor.BlueCheese}
        />
      </Tooltip>
      {canAward && (
        <ConditionalWrapper
          condition={isAwarded}
          wrapper={(children) => (
            <Tooltip content="You already awarded this post!">
              <div>{children}</div>
            </Tooltip>
          )}
        >
          <Tooltip content="Award">
            <CardAction
              id="reader-award-btn"
              pressed={isAwarded}
              onClick={() => {
                if (!user) {
                  showLogin({ trigger: AuthTriggers.GiveAward });
                  return;
                }
                if (!post.author) {
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
              }}
              icon={<MedalBadgeIcon />}
              iconPressed={<MedalBadgeIcon secondary />}
              label="Award"
              color={ButtonColor.Cabbage}
              buttonClassName={classNames(isAwarded && 'pointer-events-none')}
            />
          </Tooltip>
        </ConditionalWrapper>
      )}
      <BookmarkButton
        post={post}
        id="reader-bookmark-btn"
        pressed={post.bookmarked}
        onClick={() => {
          toggleBookmark({ post, origin: Origin.ReaderModal }).catch(() => {});
        }}
      />
      <Tooltip content="Copy link">
        <CardAction
          id="reader-copy-btn"
          onClick={() => copyLink({ post })}
          icon={<LinkIcon />}
          label="Copy link"
          color={ButtonColor.Cabbage}
        />
      </Tooltip>
    </CardActionBar>
  );
}
