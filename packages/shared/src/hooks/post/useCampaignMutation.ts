import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { StartCampaignProps } from '../../graphql/post/boost';
import { startCampaign, cancelPostBoost } from '../../graphql/post/boost';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { isNullOrUndefined } from '../../lib/func';
import { useTransactionError } from '../useTransactionError';
import { useToastNotification } from '../useToastNotification';
import type { TransactionCreated } from '../../graphql/njord';

interface UseCampaignMutationProps {
  onBoostSuccess?: (data: TransactionCreated, vars: StartCampaignProps) => void;
  onCancelSuccess?: () => void;
}

interface UseCampaignMutation {
  onBoostPost: typeof startCampaign;
  onCancelBoost: typeof cancelPostBoost;
  isLoadingCancel: boolean;
}

export const useCampaignMutation = ({
  onBoostSuccess,
  onCancelSuccess,
}: UseCampaignMutationProps = {}): UseCampaignMutation => {
  const client = useQueryClient();
  const { displayToast } = useToastNotification();
  const { user, updateUser } = useAuthContext();

  const { mutateAsync: onBoostPost } = useMutation({
    mutationFn: startCampaign,
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

      onBoostSuccess?.(data, vars);
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
    onBoostPost,
    onCancelBoost,
    isLoadingCancel: isPending,
  };
};
