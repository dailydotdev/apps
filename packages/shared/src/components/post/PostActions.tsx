import type { ReactElement } from 'react';
import React from 'react';
import type { QueryKey } from '@tanstack/react-query';
import classNames from 'classnames';
import {
  UpvoteIcon,
  DiscussIcon as CommentIcon,
  DownvoteIcon,
  LinkIcon,
  MedalBadgeIcon,
} from '../icons';
import type { Post } from '../../graphql/posts';
import { UserVote } from '../../graphql/posts';
import { QuaternaryButton } from '../buttons/QuaternaryButton';
import type { PostOrigin } from '../../hooks/log/useLogContextData';
import { useMutationSubscription, useVotePost } from '../../hooks';
import { Origin } from '../../lib/log';
import { Card } from '../cards/common/Card';
import ConditionalWrapper from '../ConditionalWrapper';
import { PostTagsPanel } from './block/PostTagsPanel';
import { useBlockPostPanel } from '../../hooks/post/useBlockPostPanel';
import { useBookmarkPost } from '../../hooks/useBookmarkPost';
import { ButtonColor, ButtonVariant } from '../buttons/Button';
import { BookmarkButton } from '../buttons';
import { AuthTriggers } from '../../lib/auth';
import { LazyModal } from '../modals/common/types';
import { useLazyModal } from '../../hooks/useLazyModal';
import { useAuthContext } from '../../contexts/AuthContext';
import { SimpleTooltip } from '../tooltips';
import type { AwardProps } from '../../graphql/njord';
import { generateQueryKey, RequestKey, updatePostCache } from '../../lib/query';
import { hasAccessToCores } from '../../lib/cores';
import { useIsSpecialUser } from '../../hooks/auth/useIsSpecialUser';

interface PostActionsProps {
  post: Post;
  postQueryKey: QueryKey;
  actionsClassName?: string;
  onComment?: () => unknown;
  origin?: PostOrigin;
  onCopyLinkClick?: (post?: Post) => void;
}

export function PostActions({
  onCopyLinkClick,
  post,
  actionsClassName = 'hidden mobileL:flex',
  onComment,
  origin = Origin.ArticlePage,
}: PostActionsProps): ReactElement {
  const { showLogin, user } = useAuthContext();
  const { openModal } = useLazyModal();
  const { data, onShowPanel, onClose } = useBlockPostPanel(post);
  const { showTagsPanel } = data;

  const { toggleUpvote, toggleDownvote } = useVotePost();

  const { toggleBookmark } = useBookmarkPost();

  const isSpecialUser = useIsSpecialUser({ userId: post.author.id });

  const onToggleBookmark = async () => {
    await toggleBookmark({ post, origin });
  };

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

  useMutationSubscription({
    matcher: ({ mutation }) => {
      const [requestKey] = Array.isArray(mutation.options.mutationKey)
        ? mutation.options.mutationKey
        : [];

      return requestKey === 'awards';
    },
    callback: ({
      variables: mutationVariables,
      queryClient: mutationQueryClient,
    }) => {
      const { entityId, type } = mutationVariables as AwardProps;

      mutationQueryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.Transactions, user),
        exact: false,
      });

      if (type === 'POST') {
        if (entityId !== post.id) {
          return;
        }

        updatePostCache(mutationQueryClient, post.id, {
          userState: {
            ...post.userState,
            awarded: true,
          },
          numAwards: (post.numAwards || 0) + 1,
        });

        return;
      }

      if (type === 'COMMENT') {
        mutationQueryClient.invalidateQueries({
          queryKey: generateQueryKey(RequestKey.PostComments, undefined, {
            postId: post.id,
          }),
          exact: false,
        });
      }
    },
  });

  return (
    <ConditionalWrapper
      condition={showTagsPanel !== undefined}
      wrapper={(children) => (
        <div className="flex flex-col">
          {children}
          <PostTagsPanel post={post} className="mt-4" toastOnSuccess={false} />
        </div>
      )}
    >
      <div className="flex items-center rounded-16 border border-border-subtlest-tertiary">
        <Card
          className={classNames(
            'flex !flex-row gap-2 hover:border-border-subtlest-tertiary',
            {
              'border-accent-avocado-default hover:!border-accent-avocado-default bg-theme-overlay-float-avocado':
                post?.userState?.vote === UserVote.Up,
              'border-accent-ketchup-default hover:!border-accent-ketchup-default bg-theme-overlay-float-ketchup':
                post?.userState?.vote === UserVote.Down,
            },
          )}
        >
          <QuaternaryButton
            id="upvote-post-btn"
            pressed={post?.userState?.vote === UserVote.Up}
            onClick={onToggleUpvote}
            icon={
              <UpvoteIcon secondary={post?.userState?.vote === UserVote.Up} />
            }
            aria-label="Upvote"
            responsiveLabelClass={actionsClassName}
            variant={ButtonVariant.Tertiary}
            color={ButtonColor.Avocado}
          />
          <QuaternaryButton
            id="downvote-post-btn"
            pressed={post?.userState?.vote === UserVote.Down}
            onClick={onToggleDownvote}
            icon={
              <DownvoteIcon
                secondary={post?.userState?.vote === UserVote.Down}
              />
            }
            aria-label="Downvote"
            responsiveLabelClass={actionsClassName}
            variant={ButtonVariant.Tertiary}
            color={ButtonColor.Ketchup}
          />
        </Card>
        <div className="flex flex-1 items-center justify-between px-4 py-2">
          <QuaternaryButton
            id="comment-post-btn"
            pressed={post.commented}
            onClick={onComment}
            icon={<CommentIcon secondary={post.commented} />}
            aria-label="Comment"
            responsiveLabelClass={actionsClassName}
            className="btn-tertiary-blueCheese"
          >
            Comment
          </QuaternaryButton>
          <BookmarkButton
            post={post}
            contextMenuId="post-content-bookmark"
            buttonProps={{
              id: 'bookmark-post-btn',
              pressed: post.bookmarked,
              onClick: onToggleBookmark,
              responsiveLabelClass: actionsClassName,
              className: 'btn-tertiary-bun',
            }}
          >
            Bookmark
          </BookmarkButton>
          <QuaternaryButton
            id="copy-post-btn"
            onClick={() => onCopyLinkClick(post)}
            icon={<LinkIcon />}
            responsiveLabelClass={actionsClassName}
            className="btn-tertiary-cabbage"
          >
            Copy
          </QuaternaryButton>
          {!!post.author && hasAccessToCores(user) && !isSpecialUser && (
            <ConditionalWrapper
              condition={post?.userState?.awarded}
              wrapper={(children) => {
                return (
                  <SimpleTooltip content="You already awarded this post!">
                    <div>{children}</div>
                  </SimpleTooltip>
                );
              }}
            >
              <QuaternaryButton
                id="award-post-btn"
                pressed={post?.userState?.awarded}
                onClick={() => {
                  if (!user) {
                    return showLogin({ trigger: AuthTriggers.GiveAward });
                  }

                  return openModal({
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
                responsiveLabelClass={actionsClassName}
                className={classNames(
                  'btn-tertiary-cabbage',
                  post?.userState?.awarded && 'pointer-events-none',
                )}
              >
                Award
              </QuaternaryButton>
            </ConditionalWrapper>
          )}
        </div>
      </div>
    </ConditionalWrapper>
  );
}
