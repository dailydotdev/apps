import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { confirmInterestBrief } from '../../../graphql/interests';

export const useConfirmInterestBrief = (id: string) => {
  const { user } = useAuthContext();
  const { displayToast } = useToastNotification();
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: (brief?: string) => confirmInterestBrief({ id, brief }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.Interests, user, id),
      });
    },
    onError: () => {
      displayToast('Failed to save the brief. Please try again.');
    },
  });

  return { isConfirmingBrief: isPending, confirmBrief: mutateAsync };
};
