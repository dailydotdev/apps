import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import type { UpdateInterestInput } from '../../../graphql/interests';
import { updateInterest } from '../../../graphql/interests';

export const useUpdateInterest = (id: string) => {
  const { user } = useAuthContext();
  const { displayToast } = useToastNotification();
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: (data: UpdateInterestInput) => updateInterest({ id, data }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: generateQueryKey(RequestKey.Interests, user, id),
        }),
        queryClient.invalidateQueries({
          queryKey: generateQueryKey(RequestKey.Interests, user),
        }),
      ]);
    },
    onError: () => {
      displayToast('Failed to update the interest. Please try again.');
    },
  });

  return { isUpdating: isPending, updateInterest: mutateAsync };
};
