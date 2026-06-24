import type { ReactElement } from 'react';
import React, { useEffect, useMemo } from 'react';
import type { QueryKey } from '@tanstack/react-query';
import classNames from 'classnames';
import {
  AnalyticsIcon,
  DiscussIcon as CommentIcon,
  DownvoteIcon,
  LinkIcon,
  MedalBadgeIcon,
} from '../icons';
import type { Post } from '../../graphql/posts';
import { UserVote } from '../../graphql/posts';
import type { PostOrigin } from '../../hooks/log/useLogContextData';
import { useMutationSubscription, useVotePost } from '../../hooks';
import { Origin } from '../../lib/log';
import { PostTagsPanel } from './block/PostTagsPanel';
import { useBlockPostPanel } from '../../hooks/post/useBlockPostPanel';
import { useBookmarkPost } from '../../hooks/useBookmarkPost';
import { ButtonColor } from '../buttons/ButtonV2';
import { CardAction } from '../buttons/CardAction';
import { CardActionBar } from '../buttons/CardActionBar';
import { BookmarkButton } from '../buttons/BookmarkButton.v2';
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
import { getPostImpressions } from '../../lib/impressions';
import { Tooltip } from '../tooltip/Tooltip';
import ConditionalWrapper from '../ConditionalWrapper';
import { useBrandSponsorship } from '../../hooks/useBrandSponsorship';
import { UpvoteButtonIcon } from '../cards/common/UpvoteButtonIcon';
import { usePostActionsLabelVisibility } from './usePostActionsLabelVisibility';

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
  const { showLogin, user } = useAuthContext();
  const { openModal } = useLazyModal();
  const { data, onShowPanel, onClose } = useBlockPostPanel(post);
  const { showTagsPanel } = data;
  const { ref: actionsRef } = usePostActionsLabelVisibility();
  const canAward = useCanAwardUser({
    sendingUser: user,
    receivingUser: post.author as LoggedUser | undefined,
  });
  const { getUpvoteAnimation } = useBrandSponsorship();

  const { toggleUpvote, toggleDownvote } = useVotePost();
  const isUpvoteActive = post?.userState?.vote === UserVote.Up;
  const isDownvoteActive = post?.userState?.vote === UserVote.Down;
  const isAwarded = !!post?.userState?.awarded;

  const brandAnimation = useMemo(() => {
    const animationResult = getUpvoteAnimation(post.tags || []);
    if (
      !animationResult.shouldAnimate ||
      !animationResult.colors ||
      !animationResult.config
    ) {
      return null;
    }
    return {
      colors: animationResult.colors,
      config: animationResult.config,
      brandLogo: animationResult.brandLogo,
    };
  }, [getUpvoteAnimation, post.tags]);

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
        queryKey: generateQueryKey(RequestKey.Products, undefined, 'summary'),
      });

      mutationQueryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.Awards, undefined, {
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

        if (!post.userState || awardProduct?.value === undefined) {
          return;
        }

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

  // Re-measure when Award button mounts/unmounts; ResizeObserver in
  // usePostActionsLabelVisibility only fires on box-size changes.
  useEffect(() => {
    const el = actionsRef.current;
    if (!el) {
      return;
    }
    const wrappers = el.querySelectorAll<HTMLElement>('.card-action-content');
    wrappers.forEach((w) => w.classList.remove('hidden'));
    if (el.scrollWidth > el.clientWidth) {
      wrappers.forEach((w) => w.classList.add('hidden'));
    }
  }, [actionsRef, isAwarded, canAward]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center rounded-16 border border-border-subtlest-tertiary">
        <CardActionBar
          ref={actionsRef}
          layout="between"
          className="overflow-hidden p-2"
        >
          <Tooltip
            content={isUpvoteActive ? 'Remove upvote' : 'More like this'}
          >
            <CardAction
              density="compact"
              id="upvote-post-btn"
              pressed={isUpvoteActive}
              onClick={onToggleUpvote}
              icon={<UpvoteButtonIcon brandAnimation={brandAnimation} />}
              iconPressed={
                <UpvoteButtonIcon secondary brandAnimation={brandAnimation} />
              }
              label="Upvote"
              color={ButtonColor.Avocado}
            />
          </Tooltip>
          <Tooltip
            content={isDownvoteActive ? 'Remove downvote' : 'Less like this'}
          >
            <CardAction
              density="compact"
              id="downvote-post-btn"
              pressed={isDownvoteActive}
              onClick={onToggleDownvote}
              icon={<DownvoteIcon />}
              iconPressed={<DownvoteIcon secondary />}
              label="Downvote"
              color={ButtonColor.Ketchup}
            />
          </Tooltip>
          <CardAction
            density="compact"
            id="comment-post-btn"
            pressed={post.commented}
            onClick={onComment}
            icon={<CommentIcon />}
            iconPressed={<CommentIcon secondary />}
            label="Comment"
            labelVisible
            color={ButtonColor.BlueCheese}
          />
          <Tooltip content="Impressions">
            <CardAction
              density="compact"
              id="impressions-post-btn"
              icon={<AnalyticsIcon />}
              label="Impressions"
              count={getPostImpressions(post)}
              color={ButtonColor.Cheese}
            />
          </Tooltip>
          {canAward && (
            <ConditionalWrapper
              condition={isAwarded}
              wrapper={(children) => {
                return (
                  <Tooltip content="You already awarded this post!">
                    <div>{children}</div>
                  </Tooltip>
                );
              }}
            >
              <CardAction
                density="compact"
                id="award-post-btn"
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
                labelVisible
                color={ButtonColor.Cabbage}
                buttonClassName={classNames(isAwarded && 'pointer-events-none')}
              />
            </ConditionalWrapper>
          )}
          <BookmarkButton
            density="compact"
            post={post}
            id="bookmark-post-btn"
            pressed={post.bookmarked}
            onClick={onToggleBookmark}
            label="Bookmark"
            labelVisible
          />
          <CardAction
            density="compact"
            id="copy-post-btn-post"
            onClick={() => onCopyLinkClick?.(post)}
            icon={<LinkIcon />}
            label="Copy"
            labelVisible
            color={ButtonColor.Cabbage}
          />
        </CardActionBar>
      </div>
      {showTagsPanel !== undefined && (
        <PostTagsPanel post={post} className="mt-4" toastOnSuccess={false} />
      )}
    </div>
  );
}
