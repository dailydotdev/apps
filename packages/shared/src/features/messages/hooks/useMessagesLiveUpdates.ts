import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { getDmTransport } from '../transport';
import { dmConversationsQueryKey, dmThreadQueryKey } from '../queries';
import type { DmMessage } from '../types';
import { DmMessageStatus } from '../types';

const peerUnavailableCopy = "This user isn't accepting messages";

// Server copies win, but messages that never reached the server only exist
// here, so a refetch must not drop them.
export const mergeWithLocalMessages = (
  fromServer: DmMessage[],
  cached: DmMessage[] = [],
): DmMessage[] => {
  const known = new Set(fromServer.map(({ id }) => id));
  const localOnly = cached.filter(
    ({ id, status }) => status !== DmMessageStatus.Sent && !known.has(id),
  );

  return [...fromServer, ...localOnly];
};

// Feeds incoming messages into the query cache. Mount it once per surface that
// shows messages; the shared transport fans one connection out to all of them.
export const useMessagesLiveUpdates = (enabled: boolean): void => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const { displayToast } = useToastNotification();

  useEffect(() => {
    if (!enabled || !user?.id) {
      return undefined;
    }

    const transport = getDmTransport(user.id);

    return transport.subscribe((event) => {
      if (event.type === 'reconnected') {
        // Anything that arrived while offline is only in the archive.
        queryClient
          .getQueriesData<DmMessage[]>({
            queryKey: generateQueryKey(
              RequestKey.DirectMessages,
              user,
              'thread',
            ),
          })
          .forEach(([queryKey]) => {
            // Keys come from dmThreadQueryKey: [..., 'thread', { peerId }].
            const { peerId } = (queryKey[3] ?? {}) as { peerId?: string };
            if (!peerId) {
              return;
            }

            transport
              .getMessages(peerId)
              .then((fromServer) =>
                queryClient.setQueryData<DmMessage[]>(queryKey, (current) =>
                  mergeWithLocalMessages(fromServer, current),
                ),
              )
              .catch(() => undefined);
          });
        queryClient.invalidateQueries({
          queryKey: dmConversationsQueryKey(user),
        });
        return;
      }

      if (event.type === 'rejected') {
        displayToast(peerUnavailableCopy);
        queryClient.setQueryData<DmMessage[]>(
          dmThreadQueryKey(user, event.peerId),
          (messages) =>
            messages?.map((message) =>
              message.id === event.messageId
                ? { ...message, status: DmMessageStatus.Rejected }
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
  }, [displayToast, enabled, queryClient, user]);
};
