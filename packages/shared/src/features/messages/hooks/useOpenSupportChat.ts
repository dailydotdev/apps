import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { LogEvent, Origin } from '../../../lib/log';
import { openCompanySupportChat } from '../graphql';
import { dmConversationsQueryKey, dmPeerQueryKey } from '../queries';
import { supportChatToPeer } from '../support';
import { DmOrigin, getMessagesUrl } from '../urls';

type UseOpenSupportChat = {
  openSupportChat: () => void;
  isPending: boolean;
};

// Opens the company page's support chat with the daily.dev team, creating
// it the first time, and takes the admin into it.
export const useOpenSupportChat = (sourceId: string): UseOpenSupportChat => {
  const { user } = useAuthContext();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();

  const { mutate, isPending } = useMutation({
    mutationFn: () => openCompanySupportChat(sourceId),
    onSuccess: (chat) => {
      const peer = supportChatToPeer(chat);
      // The thread opens with the group already known instead of asking
      // for it again.
      queryClient.setQueryData(dmPeerQueryKey(user, peer.id), peer);
      queryClient.invalidateQueries({
        queryKey: dmConversationsQueryKey(user),
      });
      logEvent({
        event_name: LogEvent.OpenCompanySupportChat,
        target_id: sourceId,
        extra: JSON.stringify({ origin: Origin.SquadPage }),
      });
      router.push(getMessagesUrl(peer.id, { origin: DmOrigin.CompanyPage }));
    },
    onError: () => {
      displayToast("Couldn't open the support chat. Try again.");
    },
  });

  return { openSupportChat: () => mutate(), isPending };
};
