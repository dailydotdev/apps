import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  BoostEstimatedReach,
  BoostPostProps,
} from '../../graphql/post/boost';
import {
  getBoostEstimatedReach,
  startPostBoost,
  cancelPostBoost,
} from '../../graphql/post/boost';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { isNullOrUndefined } from '../../lib/func';

interface UsePostBoostMutationProps {
  toEstimate?: BoostPostProps;
  onBoostSuccess?: () => void;
  onCancelSuccess?: () => void;
}

interface UsePostBoostMutation {
  estimatedReach: BoostEstimatedReach;
  onBoostPost: typeof startPostBoost;
  onCancelBoost: typeof cancelPostBoost;
}

export const usePostBoostMutation = ({
  toEstimate,
  onBoostSuccess,
  onCancelSuccess,
}: UsePostBoostMutationProps = {}): UsePostBoostMutation => {
  const client = useQueryClient();
  const { user, updateUser } = useAuthContext();
  const { data: estimatedReach } = useQuery({
    queryKey: generateQueryKey(
      RequestKey.PostCampaigns,
      user,
      'estimate',
      toEstimate,
    ),
    queryFn: () => getBoostEstimatedReach(toEstimate),
    enabled: !!toEstimate,
    initialData: { min: 0, max: 0 },
  });

  const { mutateAsync: onBoostPost } = useMutation({
    mutationFn: startPostBoost,
    onSuccess: (data) => {
      if (data.transactionId) {
        const balance = data?.balance;

        if (!isNullOrUndefined(balance)) {
          updateUser({ ...user, balance });
        }

        client.invalidateQueries({
          queryKey: generateQueryKey(RequestKey.Transactions, user),
          exact: false,
        });

        onBoostSuccess?.();
      }
    },
  });

  const { mutateAsync: onCancelBoost } = useMutation({
    mutationFn: cancelPostBoost,
    onSuccess: onCancelSuccess,
  });

  return { estimatedReach, onBoostPost, onCancelBoost };
};
