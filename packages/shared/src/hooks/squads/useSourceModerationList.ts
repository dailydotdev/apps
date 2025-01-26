import type { InfiniteData } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { MouseEventHandler } from 'react';
import { useCallback } from 'react';
import type {
  SquadPostRejectionProps,
  SquadPostModerationProps,
  SourcePostModeration,
} from '../../graphql/squads';
import {
  PostModerationReason,
  squadApproveMutation,
  squadRejectMutation,
  deletePendingPostMutation,
} from '../../graphql/squads';
import { useLazyModal } from '../useLazyModal';
import { LazyModal } from '../../components/modals/common/types';
import { usePrompt } from '../usePrompt';
import { useToastNotification } from '../useToastNotification';
import { generateQueryKey, RequestKey } from '../../lib/query';
import type { Squad } from '../../graphql/sources';
import { LogEvent } from '../../lib/log';
import { useLogContext } from '../../contexts/LogContext';
import { postLogEvent } from '../../lib/feed';
import type { Post } from '../../graphql/posts';
import type { Connection } from '../../graphql/common';
import { useAuthContext } from '../../contexts/AuthContext';

export const rejectReasons: { value: PostModerationReason; label: string }[] = [
  {
    value: PostModerationReason.OffTopic,
    label: 'Off-topic post unrelated to the Squad',
  },
  {
    value: PostModerationReason.Violation,
    label: 'Violates the Squad’s code of conduct',
  },
  {
    value: PostModerationReason.Promotional,
    label: 'Too promotional without adding value',
  },
  {
    value: PostModerationReason.Duplicate,
    label: 'Duplicate or similar content already posted',
  },
  { value: PostModerationReason.LowQuality, label: 'Lacks quality or clarity' },
  {
    value: PostModerationReason.NSFW,
    label: 'Inappropriate, NSFW or offensive post',
  },
  { value: PostModerationReason.Spam, label: 'Post is spam or scam' },
  {
    value: PostModerationReason.Misinformation,
    label: 'Contains misleading or false information',
  },
  {
    value: PostModerationReason.Copyright,
    label: 'Copyright or privacy violation',
  },
  { value: PostModerationReason.Other, label: 'Other' },
];

export interface UseSourceModerationList {
  onApprove: (
    ids: string[],
    sourceId?: string,
    onSuccess?: MouseEventHandler,
  ) => Promise<void>;
  onReject: (
    id: string,
    sourceId?: string,
    onSuccess?: MouseEventHandler,
  ) => void;
  onDelete: (postId: string) => Promise<void>;
  isPending: boolean;
  isSuccess: boolean;
}

const getLogPostsFromModerationArray = (data: SourcePostModeration[]) => {
  return data.map<Post>((item) => ({
    id: item.id,
    source: item.source,
    type: item.type,
    image: item.image,
    commentsPermalink: '',
    author: item.createdBy,
    createdAt: item.createdAt,
  }));
};

export const useSourceModerationList = ({
  squad,
}: {
  squad?: Squad;
}): UseSourceModerationList => {
  const { openModal, closeModal } = useLazyModal();
  const { displayToast } = useToastNotification();
  const { showPrompt } = usePrompt();
  const { logEvent } = useLogContext();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const listQueryKey = generateQueryKey(
    RequestKey.SquadPostRequests,
    user,
    squad?.id,
  );
  const squadQueryKey = generateQueryKey(RequestKey.Squad, user, squad?.handle);

  const handleOptimistic = useCallback(
    (data: SquadPostModerationProps) => {
      const currentData =
        queryClient.getQueryData<
          InfiniteData<Connection<SourcePostModeration>>
        >(listQueryKey);

      const currentSquad = queryClient.getQueryData<Squad | null>(
        squadQueryKey,
      );
      if (currentSquad) {
        queryClient.setQueryData<Squad>(squadQueryKey, (sqd) => {
          return {
            ...sqd,
            moderationPostCount:
              currentSquad.moderationPostCount - data.postIds.length,
          };
        });
      }

      queryClient.setQueryData<InfiniteData<Connection<SourcePostModeration>>>(
        listQueryKey,
        (oldData) => {
          if (!oldData) {
            return oldData;
          }
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              edges: page.edges.filter(
                (edge) => !data.postIds.includes(edge.node.id),
              ),
            })),
          };
        },
      );

      return { currentData, currentSquad };
    },
    [queryClient, listQueryKey, squadQueryKey],
  );

  const {
    mutateAsync: onApprove,
    isPending: isPendingApprove,
    isSuccess: isSuccessApprove,
  } = useMutation({
    mutationFn: ({ postIds }: SquadPostModerationProps) =>
      squadApproveMutation(postIds),
    onMutate: (data) => handleOptimistic(data),
    onSuccess: (data) => {
      displayToast('Post(s) approved successfully');
      getLogPostsFromModerationArray(data).forEach((post) => {
        logEvent(postLogEvent(LogEvent.ApprovePost, post));
      });
    },
    onError: (_, variables, context) => {
      if (variables.postIds.length > 50) {
        displayToast(
          'Failed to approve post(s). Please approve maximum 50 posts at a time',
        );
        return;
      }
      queryClient.setQueryData(listQueryKey, context?.currentData);
      queryClient.setQueryData(squadQueryKey, context?.currentSquad);
      displayToast('Failed to approve post(s)');
    },
  });

  const onApprovePost: UseSourceModerationList['onApprove'] = useCallback(
    async (postIds, sourceId) => {
      if (postIds.length === 1) {
        await onApprove({ postIds, sourceId });
        return;
      }

      const confirmed = await showPrompt({
        title: `Approve all ${postIds.length} posts?`,
        description: 'This action cannot be undone.',
        okButton: {
          title: 'Yes, Approve all',
        },
      });

      if (confirmed) {
        await onApprove({ postIds, sourceId });
      }
    },
    [onApprove, showPrompt],
  );

  const {
    mutateAsync: onReject,
    isPending: isPendingReject,
    isSuccess: isSuccessReject,
  } = useMutation({
    mutationFn: (props: SquadPostRejectionProps) => squadRejectMutation(props),
    onMutate: (data) => handleOptimistic(data),
    onSuccess: (data) => {
      displayToast('Post(s) declined successfully');
      getLogPostsFromModerationArray(data).forEach((post) => {
        logEvent(postLogEvent(LogEvent.RejectPost, post));
      });
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(listQueryKey, context.currentData);
      queryClient.setQueryData(squadQueryKey, context.currentSquad);
    },
  });

  const onRejectPost: UseSourceModerationList['onReject'] = useCallback(
    (postId, sourceId) => {
      openModal({
        type: LazyModal.ReasonSelection,
        props: {
          onReport: (_, reason: PostModerationReason, note) =>
            onReject({
              postIds: [postId],
              sourceId,
              reason,
              note,
            }).then(closeModal),
          reasons: rejectReasons,
          heading: 'Select a reason for declining',
        },
      });
    },
    [closeModal, onReject, openModal],
  );

  const { mutateAsync: onDelete } = useMutation({
    mutationFn: (postId: string) => deletePendingPostMutation(postId),
    onSuccess: () => {
      displayToast('Post deleted successfully');
    },
  });

  return {
    isSuccess: isSuccessApprove || isSuccessReject,
    isPending: isPendingApprove || isPendingReject,
    onApprove: onApprovePost,
    onReject: onRejectPost,
    onDelete,
  };
};
