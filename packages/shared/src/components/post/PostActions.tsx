import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
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
import type { AwardProps } from '../../graphql/njord';
import { getProductsQueryOptions } from '../../graphql/njord';
import { generateQueryKey, RequestKey, updatePostCache } from '../../lib/query';
import type { LoggedUser } from '../../lib/user';
import { useCanAwardUser } from '../../hooks/useCoresFeature';
import { useUpdateQuery } from '../../hooks/useUpdateQuery';
import { Tooltip } from '../tooltip/Tooltip';
import { useFeature } from '../GrowthBookProvider';
import {
  featureCardUiButtons,
  featurePostUiImprovements,
} from '../../lib/featureManagement';

interface PostActionsProps {
  post: Post;
  postQueryKey: QueryKey;
  onComment?: () => unknown;
  origin?: PostOrigin;
  onCopyLinkClick?: (post?: Post) => void;
}

export function PostActions({
  onCopyLinkClick,
  post,
  onComment,
  origin = Origin.ArticlePage,
}: PostActionsProps): ReactElement {
  const colorExp = useFeature(featurePostUiImprovements);
  const { showLogin, user } = useAuthContext();
  const buttonExp = useFeature(featureCardUiButtons);
  const { openModal } = useLazyModal();
  const { data, onShowPanel, onClose } = useBlockPostPanel(post);
  const { showTagsPanel } = data;
  const actionsRef = useRef<HTMLDivElement>(null);
  const canAward = useCanAwardUser({
    sendingUser: user,
    receivingUser: post.author as LoggedUser,
  });

  // Experiment configuration
  const config = {
    showVoteButtonsInActions: buttonExp,
    showVoteButtonsInCard: !buttonExp,
    copyButtonColor: colorExp ? ButtonColor.Water : ButtonColor.Cabbage,
    copyButtonClassName: colorExp ? 'group-hover:text-text-link' : undefined,
  };

  const { toggleUpvote, toggleDownvote } = useVotePost();

  const { toggleBookmark } = useBookmarkPost();

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

  const [getProducts] = useUpdateQuery(getProductsQueryOptions());

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
      const { entityId, type, note, productId } =
        mutationVariables as AwardProps;

      mutationQueryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.Transactions, user),
        exact: false,
      });

      mutationQueryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.Products, null, 'summary'),
      });

      mutationQueryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.Awards, null, {
          id: entityId,
          type,
        }),
        exact: false,
      });

      if (type === 'POST') {
        if (entityId !== post.id) {
          return;
        }

        const awardProduct = getProducts()?.edges.find(
          (item) => item.node.id === productId,
        )?.node;

        updatePostCache(mutationQueryClient, post.id, {
          userState: {
            ...post.userState,
            awarded: true,
          },
          numAwards: (post.numAwards || 0) + 1,
          featuredAward:
            !post.featuredAward?.award?.value ||
            awardProduct?.value > post.featuredAward?.award?.value
              ? {
                  award: awardProduct,
                }
              : post.featuredAward,
        });
      }

      if (note || type === 'COMMENT') {
        mutationQueryClient.invalidateQueries({
          queryKey: generateQueryKey(RequestKey.PostComments, undefined, {
            postId: post.id,
          }),
          exact: false,
        });
      }
    },
  });

  useEffect(() => {
    const adjustActions = () => {
      const actions = actionsRef.current;
      if (!actions) {
        return;
      }

      const labels = actions.querySelectorAll('.btn-quaternary label');
      labels.forEach((label) => label.classList.remove('hidden'));

      const isOverflowing = actions.scrollWidth > actions.clientWidth;
      if (isOverflowing) {
        labels.forEach((label) => label.classList.add('hidden'));
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      adjustActions();
    });

    if (actionsRef.current && globalThis) {
      resizeObserver.observe(actionsRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };

    // It needs the post?.userState?.awarded and canAward dependency to ensure that the querySelector
    // for labels is executed after the DOM is updated with the new state.
  }, [post?.userState?.awarded, canAward]);

  const renderVoteButtons = () => (
    <>
      <QuaternaryButton
        id="upvote-post-btn"
        pressed={post?.userState?.vote === UserVote.Up}
        onClick={onToggleUpvote}
        icon={<UpvoteIcon secondary={post?.userState?.vote === UserVote.Up} />}
        aria-label="Upvote"
        variant={ButtonVariant.Tertiary}
        color={ButtonColor.Avocado}
      />
      <QuaternaryButton
        id="downvote-post-btn"
        pressed={post?.userState?.vote === UserVote.Down}
        onClick={onToggleDownvote}
        icon={
          <DownvoteIcon secondary={post?.userState?.vote === UserVote.Down} />
        }
        aria-label="Downvote"
        variant={ButtonVariant.Tertiary}
        color={ButtonColor.Ketchup}
      />
    </>
  );

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
        {config.showVoteButtonsInCard && (
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
            {renderVoteButtons()}
          </Card>
        )}
        <div
          className="flex flex-1 items-center justify-between gap-x-1 overflow-hidden py-2 pl-4 pr-6"
          ref={actionsRef}
        >
          {config.showVoteButtonsInActions && renderVoteButtons()}
          <QuaternaryButton
            id="comment-post-btn"
            pressed={post.commented}
            onClick={onComment}
            icon={<CommentIcon secondary={post.commented} />}
            aria-label="Comment"
            className="btn-tertiary-blueCheese"
          >
            Comment
          </QuaternaryButton>
          {canAward && (
            <ConditionalWrapper
              condition={post?.userState?.awarded}
              wrapper={(children) => {
                return (
                  <Tooltip content="You already awarded this post!">
                    <div>{children}</div>
                  </Tooltip>
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
                icon={<MedalBadgeIcon secondary={!post?.userState?.awarded} />}
                className={classNames(
                  'btn-tertiary-cabbage',
                  post?.userState?.awarded && 'pointer-events-none',
                )}
              >
                Award
              </QuaternaryButton>
            </ConditionalWrapper>
          )}
          <BookmarkButton
            post={post}
            buttonProps={{
              id: 'bookmark-post-btn',
              pressed: post.bookmarked,
              onClick: onToggleBookmark,
              className: 'btn-tertiary-bun',
            }}
          >
            Bookmark
          </BookmarkButton>
          <QuaternaryButton
            id="copy-post-btn"
            onClick={() => onCopyLinkClick(post)}
            icon={<LinkIcon />}
            variant={ButtonVariant.Tertiary}
            className="group text-text-tertiary"
            color={config.copyButtonColor}
            labelClassName={config.copyButtonClassName}
          >
            Copy
          </QuaternaryButton>
        </div>
      </div>
    </ConditionalWrapper>
  );
}
