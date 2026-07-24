import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { sendInterestCommand } from '../../../graphql/interests';

export const useSendInterestCommand = (id: string) => {
  const { user } = useAuthContext();
  const { displayToast } = useToastNotification();
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: (text: string) => sendInterestCommand({ id, text }),
    onSuccess: async () => {
      displayToast('The agent is working on it ✅');
      await queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.InterestFindings, user, id),
      });
    },
    onError: () => {
      displayToast('Failed to send the command. Please try again.');
    },
  });

  return { isSending: isPending, sendCommand: mutateAsync };
};
