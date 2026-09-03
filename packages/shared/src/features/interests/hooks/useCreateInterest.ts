import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import type { CreateInterestSettings } from '../../../graphql/interests';
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
    mutationFn: (input: { query: string; settings?: CreateInterestSettings }) =>
      createInterest(input),
    onSuccess: async (interest) => {
      // Without priming, the page opened below mounts while the fetch is still
      // in flight and lands on an empty transcript.
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
