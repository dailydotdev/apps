import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { getDmTransport } from '../transport';
import { dmConversationsQueryKey, dmThreadQueryKey } from '../queries';
import type { DmMessage } from '../types';
import { DmMessageStatus } from '../types';

// Feeds incoming messages into the query cache. Mount it once per surface that
// shows messages; the shared transport fans one connection out to all of them.
export const useMessagesLiveUpdates = (enabled: boolean): void => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || !user?.id) {
      return undefined;
    }

    return getDmTransport(user.id).subscribe((event) => {
      if (event.type === 'reconnected') {
        queryClient.invalidateQueries({
          queryKey: generateQueryKey(RequestKey.DirectMessages, user),
        });
        return;
      }

      if (event.type === 'failed') {
        queryClient.setQueryData<DmMessage[]>(
          dmThreadQueryKey(user, event.peerId),
          (messages) =>
            messages?.map((message) =>
              message.id === event.messageId
                ? { ...message, status: DmMessageStatus.Failed }
                : message,
            ),
        );
        return;
      }

      const { message } = event;
      queryClient.setQueryData<DmMessage[]>(
        dmThreadQueryKey(user, message.peerId),
        // An unloaded thread stays unloaded, or it would open without history.
        (messages) =>
          !messages || messages.some(({ id }) => id === message.id)
            ? messages
            : [...messages, message],
      );
      queryClient.invalidateQueries({
        queryKey: dmConversationsQueryKey(user),
      });
    });
  }, [enabled, queryClient, user]);
};
