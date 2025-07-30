import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  BoostEstimatedReach,
  EstimatedReachProps,
} from '../../graphql/post/boost';
import {
  getBoostEstimatedReach,
  startPostBoost,
  cancelPostBoost,
  getBoostEstimatedReachDaily,
} from '../../graphql/post/boost';
import {
  generateQueryKey,
  RequestKey,
  StaleTime,
  updatePostCache,
} from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { isNullOrUndefined } from '../../lib/func';
import { useTransactionError } from '../useTransactionError';
import { useToastNotification } from '../useToastNotification';

interface UsePostBoostMutationProps {
  toEstimate?: Pick<EstimatedReachProps, 'id'> | EstimatedReachProps;
  onBoostSuccess?: () => void;
  onCancelSuccess?: () => void;
}

interface UsePostBoostMutation {
  estimatedReach: BoostEstimatedReach;
  onBoostPost: typeof startPostBoost;
  onCancelBoost: typeof cancelPostBoost;
  isLoadingCancel: boolean;
  isLoadingEstimate: boolean;
}

const placeholderData = { min: 0, max: 0 };

export const usePostBoostMutation = ({
  toEstimate,
  onBoostSuccess,
  onCancelSuccess,
}: UsePostBoostMutationProps = {}): UsePostBoostMutation => {
  const client = useQueryClient();
  const { displayToast } = useToastNotification();
  const { user, updateUser } = useAuthContext();
  const { data: estimatedReach, isPending: isLoadingEstimate } = useQuery({
    queryKey: generateQueryKey(
      RequestKey.PostCampaigns,
      user,
      'estimate',
      toEstimate ? Object.values(toEstimate).join(':') : undefined,
    ),
    queryFn: () => {
      if ('budget' in toEstimate) {
        return getBoostEstimatedReachDaily(toEstimate);
      }

      return getBoostEstimatedReach(toEstimate);
    },
    enabled: !!toEstimate,
    placeholderData,
    staleTime: StaleTime.Default,
  });

  const { mutateAsync: onBoostPost } = useMutation({
    mutationFn: startPostBoost,
    onSuccess: (data, vars) => {
      if (!data.transactionId) {
        return;
      }

      const balance = data?.balance;

      if (!isNullOrUndefined(balance)) {
        updateUser({ ...user, balance });
      }

      client.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.Transactions, user),
        exact: false,
      });

      client.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.PostCampaigns, user),
        exact: false,
      });

      if (data.referenceId) {
        updatePostCache(client, vars.id, (post) => ({
          flags: { ...post.flags, campaignId: data.referenceId },
        }));
      }

      onBoostSuccess?.();
    },
    onError: useTransactionError(),
  });

  const { mutateAsync: onCancelBoost, isPending } = useMutation({
    mutationFn: cancelPostBoost,
    onSuccess: async (data) => {
      if (!data.transactionId) {
        return;
      }

      const balance = data?.balance;

      if (!isNullOrUndefined(balance)) {
        updateUser({ ...user, balance });
      }

      client.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.Transactions, user),
        exact: false,
      });

      client.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.PostCampaigns, user),
        exact: false,
      });

      displayToast('Post boost canceled!');

      onCancelSuccess?.();
    },
  });

  return {
    estimatedReach: estimatedReach ?? placeholderData,
    onBoostPost,
    onCancelBoost,
    isLoadingCancel: isPending,
    isLoadingEstimate,
  };
};
