import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { createInterest } from '../../../graphql/interests';

export const useCreateInterest = ({
  onCreated,
}: {
  onCreated?: (id: string) => void;
} = {}) => {
  const { user } = useAuthContext();
  const { displayToast } = useToastNotification();
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: (query: string) => createInterest(query),
    onSuccess: async (interest) => {
      await queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.Interests, user),
      });
      onCreated?.(interest.id);
    },
    onError: () => {
      displayToast('Failed to create the interest. Please try again.');
    },
  });

  return { isCreating: isPending, createInterest: mutateAsync };
};
