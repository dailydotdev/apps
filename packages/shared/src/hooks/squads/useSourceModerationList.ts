import type { InfiniteData } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import type {
  PostModerationReason,
  SourcePostModeration,
  SquadAuthorProps,
} from '../../graphql/squads';
import {
  deletePendingPostMutation,
  muteSourceAuthor,
  rejectSourceAuthorPendingPosts,
  squadApproveMutation,
  squadRejectMutation,
  unmuteSourceAuthor,
  updateSquadMemberRole,
} from '../../graphql/squads';
import { SourceMemberRole } from '../../graphql/sources';
import type { Connection } from '../../graphql/common';
import { useLazyModal } from '../useLazyModal';
import { LazyModal } from '../../components/modals/common/types';
import { usePrompt } from '../usePrompt';
import { useToastNotification } from '../useToastNotification';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { LogEvent, TargetType } from '../../lib/log';
import { useLogContext } from '../../contexts/LogContext';
import { postLogEvent } from '../../lib/feed';
import { PostType } from '../../graphql/posts';
import type { Post } from '../../graphql/posts';
import { useAuthContext } from '../../contexts/AuthContext';
import { ButtonColor, ButtonVariant } from '../../components/buttons/Button';

export interface DeclinePostsParams {
  reason: PostModerationReason;
  note?: string;
  /** Declines every pending post of the author in the squad. */
  allFromAuthor?: boolean;
  mute?: boolean;
}

export interface UseSourceModerationList {
  onApprove: (items: SourcePostModeration[]) => Promise<unknown>;
  onReject: (
    items: SourcePostModeration[],
    options?: Pick<DeclinePostsParams, 'allFromAuthor'>,
  ) => void;
  onMute: (item: SourcePostModeration) => Promise<void>;
  onBlock: (item: SourcePostModeration) => Promise<void>;
  onDelete: (postId: string) => Promise<void>;
  isPending: boolean;
}

type QueueData = InfiniteData<Connection<SourcePostModeration>>;

const getLogPostsFromModerationArray = (data: SourcePostModeration[]) => {
  return data.map<Post>((item) => {
    return {
      id: item.id,
      source: item.source,
      type: item.type ?? PostType.Article,
      image: item.image ?? '',
      commentsPermalink: '',
      author: item.createdBy,
      createdAt: item.createdAt,
    };
  });
};

const getAuthor = (item: SourcePostModeration): SquadAuthorProps => ({
  sourceId: item.source?.id ?? '',
  userId: item.createdBy?.id ?? '',
});

const isSameAuthor =
  ({ sourceId, userId }: SquadAuthorProps) =>
  (item: SourcePostModeration): boolean =>
    item.source?.id === sourceId && item.createdBy?.id === userId;

const pluralizePosts = (count: number): string =>
  count === 1 ? 'Post' : `${count} posts`;

export const useSourceModerationList = (): UseSourceModerationList => {
  const { openModal, closeModal } = useLazyModal();
  const { displayToast } = useToastNotification();
  const { showPrompt } = usePrompt();
  const { logEvent } = useLogContext();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const queryKey = generateQueryKey(RequestKey.SquadPostRequests, user);

  const refreshQueue = useCallback(
    (items: SourcePostModeration[]) => {
      queryClient.invalidateQueries({ queryKey });
      new Set(items.map(({ source }) => source?.handle)).forEach((handle) => {
        if (handle) {
          queryClient.invalidateQueries({
            queryKey: generateQueryKey(RequestKey.Squad, user, handle),
          });
        }
      });
    },
    [queryClient, queryKey, user],
  );

  // Moderated posts leave every loaded queue at once, then the queues and the
  // squad's pending count refetch behind them.
  const removeFromQueue = useCallback(
    (
      isRemoved: (item: SourcePostModeration) => boolean,
      items: SourcePostModeration[],
    ) => {
      queryClient.setQueriesData<QueueData>({ queryKey }, (data) =>
        data
          ? {
              ...data,
              pages: data.pages.map((page) => ({
                ...page,
                edges: page.edges.filter(({ node }) => !isRemoved(node)),
              })),
            }
          : data,
      );
      refreshQueue(items);
    },
    [queryClient, queryKey, refreshQueue],
  );

  const { mutateAsync: approve, isPending: isPendingApprove } = useMutation({
    mutationFn: (items: SourcePostModeration[]) =>
      squadApproveMutation(items.map(({ id }) => id)),
    onSuccess: (data, items) => {
      const ids = items.map(({ id }) => id);
      removeFromQueue((item) => ids.includes(item.id), items);
      displayToast(`${pluralizePosts(items.length)} approved`);
      getLogPostsFromModerationArray(data).forEach((post) => {
        logEvent(postLogEvent(LogEvent.ApprovePost, post));
      });
    },
    onError: () => {
      displayToast("Couldn't approve. Please try again.");
    },
  });

  const { mutateAsync: decline, isPending: isPendingReject } = useMutation({
    mutationFn: async ({
      items,
      reason,
      note,
      allFromAuthor,
      mute,
    }: DeclinePostsParams & { items: SourcePostModeration[] }) => {
      const [first] = items;
      const declined = allFromAuthor
        ? await rejectSourceAuthorPendingPosts({
            ...getAuthor(first),
            reason,
            note,
          })
        : await squadRejectMutation({
            postIds: items.map(({ id }) => id),
            sourceId: first.source?.id ?? '',
            reason,
            note,
          });

      if (mute) {
        await muteSourceAuthor(getAuthor(first));
      }

      return declined;
    },
    onSuccess: (data, { items, allFromAuthor, mute }) => {
      const [first] = items;
      const ids = items.map(({ id }) => id);
      removeFromQueue(
        allFromAuthor || mute
          ? isSameAuthor(getAuthor(first))
          : (item) => ids.includes(item.id),
        items,
      );
      const declined = `${pluralizePosts(
        data.length || items.length,
      )} declined`;
      displayToast(
        mute ? `${declined}, @${first.createdBy?.username} muted` : declined,
      );
      getLogPostsFromModerationArray(data).forEach((post) => {
        logEvent(postLogEvent(LogEvent.RejectPost, post));
      });
      if (mute) {
        logEvent({
          event_name: LogEvent.MuteSquadAuthor,
          target_type: TargetType.Source,
          target_id: first.source?.id,
          extra: JSON.stringify({ user_id: first.createdBy?.id }),
        });
      }
    },
    onError: () => {
      displayToast("Couldn't decline. Please try again.");
    },
  });

  const onReject: UseSourceModerationList['onReject'] = useCallback(
    (items, options) => {
      openModal({
        type: LazyModal.DeclinePost,
        props: {
          items,
          allFromAuthor: options?.allFromAuthor,
          onDecline: (params: DeclinePostsParams) =>
            decline({ ...params, items }).then(closeModal),
        },
      });
    },
    [closeModal, decline, openModal],
  );

  const onUnmute = useCallback(
    async (item: SourcePostModeration) => {
      await unmuteSourceAuthor(getAuthor(item));
      refreshQueue([item]);
      displayToast(`@${item.createdBy?.username} unmuted`);
      logEvent({
        event_name: LogEvent.UnmuteSquadAuthor,
        target_type: TargetType.Source,
        target_id: item.source?.id,
        extra: JSON.stringify({ user_id: item.createdBy?.id }),
      });
    },
    [displayToast, logEvent, refreshQueue],
  );

  const onMute: UseSourceModerationList['onMute'] = useCallback(
    async (item) => {
      try {
        await muteSourceAuthor(getAuthor(item));
      } catch {
        displayToast("Couldn't mute. Please try again.");
        return;
      }

      removeFromQueue(isSameAuthor(getAuthor(item)), [item]);
      displayToast(
        `@${item.createdBy?.username} muted. Their posts skip the queue.`,
        { action: { copy: 'Undo', onClick: () => onUnmute(item) } },
      );
      logEvent({
        event_name: LogEvent.MuteSquadAuthor,
        target_type: TargetType.Source,
        target_id: item.source?.id,
        extra: JSON.stringify({ user_id: item.createdBy?.id }),
      });
    },
    [displayToast, logEvent, onUnmute, removeFromQueue],
  );

  const onBlock: UseSourceModerationList['onBlock'] = useCallback(
    async (item) => {
      const name = item.createdBy?.name ?? item.createdBy?.username;
      const squadName = item.source?.name ?? 'the Squad';
      const confirmed = await showPrompt({
        title: `Block ${name}?`,
        description: `${name} loses access to ${squadName} and can't rejoin unless you unblock them. Their pending posts leave the queue.`,
        okButton: {
          title: 'Yes, block',
          variant: ButtonVariant.Primary,
          color: ButtonColor.Ketchup,
        },
      });

      if (!confirmed) {
        return;
      }

      try {
        const { sourceId, userId } = getAuthor(item);
        await updateSquadMemberRole({
          sourceId,
          memberId: userId,
          role: SourceMemberRole.Blocked,
        });
      } catch {
        displayToast("Couldn't block. Please try again.");
        return;
      }

      removeFromQueue(isSameAuthor(getAuthor(item)), [item]);
      queryClient.invalidateQueries({
        queryKey: [RequestKey.SquadMembers],
      });
      displayToast(`${name} is blocked from ${squadName}`);
    },
    [displayToast, queryClient, removeFromQueue, showPrompt],
  );

  const { mutateAsync: onDelete } = useMutation({
    mutationFn: (postId: string) => deletePendingPostMutation(postId),
    onSuccess: () => {
      displayToast('Post deleted');
      queryClient.invalidateQueries({
        queryKey,
      });
    },
    onError: () => {
      displayToast("Couldn't delete the post. Please try again.");
    },
  });

  return {
    isPending: isPendingApprove || isPendingReject,
    onApprove: approve,
    onReject,
    onMute,
    onBlock,
    onDelete,
  };
};
