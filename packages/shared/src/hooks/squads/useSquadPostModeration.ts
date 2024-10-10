import { useMutation } from '@tanstack/react-query';
import { MouseEventHandler, useCallback, useRef } from 'react';
import {
  PostModerationReason,
  SquadPostRejectionProps,
  squadApproveMutation,
  squadRejectMutation,
} from '../../graphql/squads';
import { useLazyModal } from '../useLazyModal';
import { LazyModal } from '../../components/modals/common/types';
import { usePrompt } from '../usePrompt';
import { useToastNotification } from '../useToastNotification';

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

interface UseSquadPostModeration {
  onApprove: (ids: string[], onSuccess?: MouseEventHandler) => Promise<void>;
  onReject: (id: string, onSuccess?: MouseEventHandler) => void;
  isLoading: boolean;
  isSuccess: boolean;
}

export const useSquadPostModeration = (): UseSquadPostModeration => {
  const onSuccessRef = useRef<MouseEventHandler>();
  const { openModal } = useLazyModal();
  const { displayToast } = useToastNotification();
  const { showPrompt } = usePrompt();
  const onSuccessWrapper = () => {
    if (onSuccessRef.current) {
      onSuccessRef.current(null);
      onSuccessRef.current = undefined;
    }
  };

  const {
    mutateAsync: onApprove,
    isLoading: isLoadingApprove,
    isSuccess: isSuccessApprove,
  } = useMutation((ids: string[]) => squadApproveMutation(ids), {
    onSuccess: () => {
      displayToast('Post(s) approved successfully');
      onSuccessWrapper();
    },
  });

  const onApprovePost: UseSquadPostModeration['onApprove'] = useCallback(
    async (ids, onSuccess) => {
      onSuccessRef.current = onSuccess;

      if (ids.length === 1) {
        onApprove(ids);
      }

      const confirmed = await showPrompt({
        title: `Approve all ${ids.length} posts?`,
      });

      if (confirmed) {
        onApprove(ids);
      }
    },
    [onApprove, showPrompt],
  );

  const {
    mutateAsync: onReject,
    isLoading: isLoadingReject,
    isSuccess: isSuccessReject,
  } = useMutation(
    (props: SquadPostRejectionProps) => squadRejectMutation(props),
    { onSuccess: onSuccessWrapper },
  );

  const onRejectPost: UseSquadPostModeration['onReject'] = useCallback(
    (postId, onSuccess) => {
      onSuccessRef.current = onSuccess;

      openModal({
        type: LazyModal.Report,
        props: {
          onReport: (_, reason, note) => onReject({ postId, reason, note }),
          reasons: rejectReasons,
          heading: 'Select a reason for declining',
        },
      });
    },
    [onReject, openModal],
  );

  return {
    isSuccess: isSuccessApprove || isSuccessReject,
    isLoading: isLoadingApprove || isLoadingReject,
    onApprove: onApprovePost,
    onReject: onRejectPost,
  };
};
