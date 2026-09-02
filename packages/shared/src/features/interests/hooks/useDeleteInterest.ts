import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { deleteInterest } from '../../../graphql/interests';

export const useDeleteInterest = ({
  onDeleted,
}: {
  onDeleted?: () => void;
} = {}) => {
  const { user } = useAuthContext();
  const { displayToast } = useToastNotification();
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: (id: string) => deleteInterest(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.Interests, user),
      });
      onDeleted?.();
    },
    onError: () => {
      displayToast('Failed to delete the interest. Please try again.');
    },
  });

  return { isDeleting: isPending, deleteInterest: mutateAsync };
};
