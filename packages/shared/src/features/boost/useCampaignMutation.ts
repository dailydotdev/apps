import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Campaign, StartCampaignProps } from '../../graphql/campaigns';
import {
  CampaignType,
  startCampaign,
  stopCampaign,
} from '../../graphql/campaigns';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { isNullOrUndefined } from '../../lib/func';
import { useTransactionError } from '../../hooks/useTransactionError';
import { useToastNotification } from '../../hooks/useToastNotification';
import type { TransactionCreated } from '../../graphql/njord';
import type { ApiErrorResult } from '../../graphql/common';

interface UseCampaignMutationProps {
  onBoostSuccess?: (data: TransactionCreated, vars: StartCampaignProps) => void;
  onBoostError?: (error: ApiErrorResult, vars: StartCampaignProps) => void;
  onCancelSuccess?: (data: TransactionCreated, id: string) => void;
}

type CancelBoostCampaign = Pick<Campaign, 'id' | 'type'>;

interface UseCampaignMutation {
  onStartBoost: typeof startCampaign;
  onCancelBoost: (campaign: CancelBoostCampaign) => Promise<TransactionCreated>;
  isLoadingCancel: boolean;
}

export const useCampaignMutation = ({
  onBoostSuccess,
  onBoostError,
  onCancelSuccess,
}: UseCampaignMutationProps = {}): UseCampaignMutation => {
  const client = useQueryClient();
  const { displayToast } = useToastNotification();
  const { user, updateUser } = useAuthContext();
  const onTransactionError = useTransactionError();

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
        queryKey: generateQueryKey(RequestKey.Campaigns, user),
        exact: false,
      });

      onBoostSuccess?.(data, vars);
    },
    onError: (error: ApiErrorResult, vars) => {
      onBoostError?.(error, vars);

      return onTransactionError(error);
    },
  });

  const { mutateAsync: onCancelBoost, isPending } = useMutation({
    mutationFn: ({ id }: CancelBoostCampaign) => stopCampaign(id),
    onSuccess: async (data, campaign) => {
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
        queryKey: generateQueryKey(RequestKey.Campaigns, user),
        exact: false,
      });

      displayToast(
        campaign.type === CampaignType.Squad
          ? 'Squad boost canceled!'
          : 'Post boost canceled!',
      );

      onCancelSuccess?.(data, campaign.id);
    },
    onError: () => {
      displayToast("We couldn't stop the boost. Please try again.");
    },
  });

  return {
    onStartBoost,
    onCancelBoost,
    isLoadingCancel: isPending,
  };
};
