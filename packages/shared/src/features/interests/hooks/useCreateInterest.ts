import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { createInterest } from '../../../graphql/interests';
import { interestQueryOptions } from '../queries';

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
      // Hand the new agent to the page we are about to open, so it has the
      // interest on its first render and the conversation is there instantly.
      // Without this the destination mounts while the fetch is still in flight
      // and lands on an empty transcript.
      queryClient.setQueryData(
        interestQueryOptions(interest.id, user).queryKey,
        interest,
      );
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
