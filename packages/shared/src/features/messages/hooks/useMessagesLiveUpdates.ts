import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { getDmTransport } from '../transport';
import {
  dmConversationsQueryKey,
  dmThreadQueryKey,
  upsertConversationMessage,
} from '../queries';
import { applyReaction } from '../stanzas';
import type { DmMessage } from '../types';
import { DmMessageStatus } from '../types';

const peerUnavailableCopy = "This user isn't accepting messages";

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

    const setStatus = (
      peerId: string,
      messageId: string,
      status: DmMessageStatus,
    ) =>
      queryClient.setQueryData<DmMessage[]>(
        dmThreadQueryKey(user, peerId),
        (messages) =>
          messages?.map((message) =>
            message.id === messageId ? { ...message, status } : message,
          ),
      );

    return getDmTransport(user.id).subscribe((event) => {
      if (event.type === 'reconnected') {
        // Anything that arrived while offline is only in the archive; thread
        // refetches keep unsent bubbles, see dmThreadQueryOptions.
        queryClient.invalidateQueries({
          queryKey: generateQueryKey(RequestKey.DirectMessages, user),
        });
        return;
      }

      if (event.type === 'sent') {
        setStatus(event.peerId, event.messageId, DmMessageStatus.Sent);
        return;
      }

      if (event.type === 'failed') {
        setStatus(event.peerId, event.messageId, DmMessageStatus.Failed);
        return;
      }

      if (event.type === 'rejected') {
        displayToast(peerUnavailableCopy);
        setStatus(event.peerId, event.messageId, DmMessageStatus.Rejected);
        return;
      }

      // A reaction isn't news: it neither reorders the inbox nor counts as
      // unread.
      if (event.type === 'reaction') {
        queryClient.setQueryData<DmMessage[]>(
          dmThreadQueryKey(user, event.reaction.peerId),
          (messages) => messages && applyReaction(messages, event.reaction),
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

      const isKnownPeer = upsertConversationMessage(
        queryClient,
        user,
        message,
        {
          isIncoming: message.senderId !== user.id,
        },
      );

      // Someone new wrote: only then is the whole list worth refetching.
      if (!isKnownPeer) {
        queryClient.invalidateQueries({
          queryKey: dmConversationsQueryKey(user),
        });
      }
    });
  }, [displayToast, enabled, queryClient, user]);
};
