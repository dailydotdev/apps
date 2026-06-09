import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { UserVote } from '../../../graphql/posts';
import {
  DiscussIcon as CommentIcon,
  DiscussIconV2 as CommentIconV2,
  DownvoteIcon,
  LinkIcon,
  MedalBadgeIcon,
  UpvoteIcon,
} from '../../icons';
import { useFeature } from '../../GrowthBookProvider';
import { featureCommentFirstAction } from '../../../lib/featureManagement';
import { Button, ButtonColor, ButtonVariant } from '../../buttons/Button';
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
import { useEngagementBarV2 } from '../../../hooks/useEngagementBarV2';
import { ReaderRailActionBar as ReaderRailActionBarV2 } from './ReaderRailActionBar.v2';

type ReaderRailActionBarProps = {
  post: Post;
  onCommentClick: () => void;
  className?: string;
};

function ReaderRailActionBarV1({
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
  const isCommentFirst = useFeature(featureCommentFirstAction);
  const CommentIconComponent = isCommentFirst ? CommentIconV2 : CommentIcon;

  const isUpvoteActive = post?.userState?.vote === UserVote.Up;
  const isDownvoteActive = post?.userState?.vote === UserVote.Down;

  const commentButton = (
    <Tooltip content="Comment">
      <Button
        id="reader-comment-btn"
        type="button"
        pressed={post.commented}
        onClick={onCommentClick}
        icon={<CommentIconComponent secondary={post.commented} />}
        aria-label="Comment"
        variant={ButtonVariant.Tertiary}
        color={ButtonColor.BlueCheese}
      />
    </Tooltip>
  );

  return (
    <div
      className={classNames(
        'flex w-full items-center justify-between',
        className,
      )}
      role="toolbar"
      aria-label="Post actions"
    >
      {isCommentFirst && commentButton}
      <Tooltip content={isUpvoteActive ? 'Remove upvote' : 'More like this'}>
        <Button
          id="reader-upvote-btn"
          type="button"
          pressed={isUpvoteActive}
          onClick={() => {
            toggleUpvote({ payload: post, origin: Origin.ReaderModal }).catch(
              () => {},
            );
          }}
          icon={<UpvoteIcon secondary={isUpvoteActive} />}
          aria-label="Upvote"
          variant={ButtonVariant.Tertiary}
          color={ButtonColor.Avocado}
        />
      </Tooltip>
      <Tooltip
        content={isDownvoteActive ? 'Remove downvote' : 'Less like this'}
      >
        <Button
          id="reader-downvote-btn"
          type="button"
          pressed={isDownvoteActive}
          onClick={() => {
            toggleDownvote({
              payload: post,
              origin: Origin.ReaderModal,
            }).catch(() => {});
          }}
          icon={<DownvoteIcon secondary={isDownvoteActive} />}
          aria-label="Downvote"
          variant={ButtonVariant.Tertiary}
          color={ButtonColor.Ketchup}
        />
      </Tooltip>
      {!isCommentFirst && commentButton}
      {canAward && (
        <ConditionalWrapper
          condition={post?.userState?.awarded ?? false}
          wrapper={(children) => (
            <Tooltip content="You already awarded this post!">
              <div>{children}</div>
            </Tooltip>
          )}
        >
          <Tooltip content="Award">
            <Button
              id="reader-award-btn"
              type="button"
              pressed={post?.userState?.awarded}
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
              icon={<MedalBadgeIcon secondary={!post?.userState?.awarded} />}
              aria-label="Award"
              variant={ButtonVariant.Tertiary}
              color={ButtonColor.Cabbage}
              className={classNames(
                post?.userState?.awarded && 'pointer-events-none',
              )}
            />
          </Tooltip>
        </ConditionalWrapper>
      )}
      <BookmarkButton
        post={post}
        buttonProps={{
          id: 'reader-bookmark-btn',
          type: 'button',
          pressed: post.bookmarked,
          onClick: () => {
            toggleBookmark({ post, origin: Origin.ReaderModal }).catch(
              () => {},
            );
          },
          variant: ButtonVariant.Tertiary,
        }}
      />
      <Tooltip content="Copy link">
        <Button
          id="reader-copy-btn"
          type="button"
          onClick={() => copyLink({ post })}
          icon={<LinkIcon />}
          aria-label="Copy link"
          variant={ButtonVariant.Tertiary}
          color={ButtonColor.Cabbage}
        />
      </Tooltip>
    </div>
  );
}

export function ReaderRailActionBar(
  props: ReaderRailActionBarProps,
): ReactElement {
  const useV2 = useEngagementBarV2();
  if (useV2) {
    return <ReaderRailActionBarV2 {...props} />;
  }
  return <ReaderRailActionBarV1 {...props} />;
}
