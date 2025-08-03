import { useMutation, useQueryClient } from '@tanstack/react-query';
import { startPostBoost, cancelPostBoost } from '../../graphql/post/boost';
import { generateQueryKey, RequestKey, updatePostCache } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { isNullOrUndefined } from '../../lib/func';
import { useTransactionError } from '../useTransactionError';
import { useToastNotification } from '../useToastNotification';

interface UsePostBoostMutationProps {
  onBoostSuccess?: () => void;
  onCancelSuccess?: () => void;
}

interface UsePostBoostMutation {
  onBoostPost: typeof startPostBoost;
  onCancelBoost: typeof cancelPostBoost;
  isLoadingCancel: boolean;
}

export const usePostBoostMutation = ({
  onBoostSuccess,
  onCancelSuccess,
}: UsePostBoostMutationProps = {}): UsePostBoostMutation => {
  const client = useQueryClient();
  const { displayToast } = useToastNotification();
  const { user, updateUser } = useAuthContext();

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
    onBoostPost,
    onCancelBoost,
    isLoadingCancel: isPending,
  };
};
