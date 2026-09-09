import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { completeInterestOnboarding } from '../../../graphql/interests';

export const useCompleteInterestOnboarding = (id: string) => {
  const { user } = useAuthContext();
  const { displayToast } = useToastNotification();
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: () => completeInterestOnboarding(id),
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
      displayToast('Failed to start the agent. Please try again.');
    },
  });

  return { isCompleting: isPending, completeOnboarding: mutateAsync };
};
