import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MouseEventHandler, useCallback } from 'react';
import {
  PostModerationReason,
  SquadPostRejectionProps,
  squadApproveMutation,
  squadRejectMutation,
  SquadPostModerationProps,
  deletePendingPostMutation,
} from '../../graphql/squads';
import { useLazyModal } from '../useLazyModal';
import { LazyModal } from '../../components/modals/common/types';
import { usePrompt } from '../usePrompt';
import { useToastNotification } from '../useToastNotification';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { Squad } from '../../graphql/sources';
import { LogEvent } from '../../lib/log';
import { useLogContext } from '../../contexts/LogContext';
import { postLogEvent } from '../../lib/feed';
import { Post } from '../../graphql/posts';

export const rejectReasons: { value: PostModerationReason; label: string }[] = [
  {
    value: PostModerationReason.OffTopic,
    label: 'Off-topic post unrelated to the Squad’s purpose',
  },
  {
    value: PostModerationReason.Violation,
    label: 'Violates the Squad’s code of conduct',
  },
  {
    value: PostModerationReason.Promotional,
    label: 'Too promotional without adding value to the discussion',
  },
  {
    value: PostModerationReason.Duplicate,
    label: 'Duplicate or similar content already posted',
  },
  { value: PostModerationReason.LowQuality, label: 'Lacks quality or clarity' },
  {
    value: PostModerationReason.NSFW,
    label: 'Contains inappropriate, NSFW or offensive content',
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
    sourceId: string,
    onSuccess?: MouseEventHandler,
  ) => Promise<void>;
  onReject: (
    id: string,
    sourceId: string,
    onSuccess?: MouseEventHandler,
  ) => void;
  onDelete: (postId: string) => Promise<void>;
  isPending: boolean;
  isSuccess: boolean;
}

export const useSourceModerationList = ({
  squad,
}: {
  squad: Squad;
}): UseSourceModerationList => {
  const { openModal, closeModal } = useLazyModal();
  const { displayToast } = useToastNotification();
  const { showPrompt } = usePrompt();
  const { logEvent } = useLogContext();
  const { user } = squad.currentMember;
  const queryClient = useQueryClient();
  const listQueryKey = generateQueryKey(
    RequestKey.SquadPostRequests,
    user,
    squad.id,
  );
  const squadQueryKey = generateQueryKey(RequestKey.Squad, user, squad.handle);

  const invalidateQueries = () => {
    Promise.all([
      queryClient.invalidateQueries({ queryKey: listQueryKey }),
      queryClient.invalidateQueries({ queryKey: squadQueryKey }),
    ]);
  };

  const {
    mutateAsync: onApprove,
    isPending: isPendingApprove,
    isSuccess: isSuccessApprove,
  } = useMutation({
    mutationFn: ({ postIds, sourceId }: SquadPostModerationProps) =>
      squadApproveMutation({
        postIds,
        sourceId,
      }),
    onSuccess: (data) => {
      displayToast('Post(s) approved successfully');

      data.forEach((item) => {
        const post: Post = {
          id: item.id,
          source: item.source,
          type: item.type,
          image: item.image,
          commentsPermalink: '',
        };
        logEvent(postLogEvent(LogEvent.ApprovePost, post));
      });

      invalidateQueries();
    },
    onError: (_, variables) => {
      if (variables.postIds.length > 50) {
        displayToast(
          'Failed to approve post(s). Please approve maximum 50 posts at a time',
        );
        return;
      }

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
    onSuccess: () => {
      displayToast('Post(s) declined successfully');
      logEvent({
        event_name: LogEvent.RejectPost,
      });
      invalidateQueries();
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
      invalidateQueries();
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
