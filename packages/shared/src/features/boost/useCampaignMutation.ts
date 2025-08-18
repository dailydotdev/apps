import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { StartCampaignProps } from '../../graphql/campaigns';
import { startCampaign, stopCampaign } from '../../graphql/campaigns';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { isNullOrUndefined } from '../../lib/func';
import { useTransactionError } from '../../hooks/useTransactionError';
import { useToastNotification } from '../../hooks/useToastNotification';
import type { TransactionCreated } from '../../graphql/njord';

interface UseCampaignMutationProps {
  onBoostSuccess?: (data: TransactionCreated, vars: StartCampaignProps) => void;
  onCancelSuccess?: () => void;
}

interface UseCampaignMutation {
  onStartBoost: typeof startCampaign;
  onCancelBoost: typeof stopCampaign;
  isLoadingCancel: boolean;
}

export const useCampaignMutation = ({
  onBoostSuccess,
  onCancelSuccess,
}: UseCampaignMutationProps = {}): UseCampaignMutation => {
  const client = useQueryClient();
  const { displayToast } = useToastNotification();
  const { user, updateUser } = useAuthContext();

  const { mutateAsync: onStartBoost } = useMutation({
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
    mutationFn: stopCampaign,
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
    onStartBoost,
    onCancelBoost,
    isLoadingCancel: isPending,
  };
};
