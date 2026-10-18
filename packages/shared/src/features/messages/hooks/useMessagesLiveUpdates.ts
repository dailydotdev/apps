import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { getDmTransport } from '../transport';
import {
  applyEditToConversations,
  dmConversationsQueryKey,
  dmThreadQueryKey,
  dmTypingQueryOptions,
  upsertConversationMessage,
} from '../queries';
import { applyEdit, applyReaction } from '../stanzas';
import type { DmMessage } from '../types';
import { DmMessageStatus } from '../types';

const peerUnavailableCopy = "This user isn't accepting messages";
// A peer who stops typing without saying so (closed the tab, lost the
// connection) shouldn't look busy forever. Their client repeats `composing`
// well within this while they keep typing.
const typingTimeoutMs = 10 * 1000;

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

    const typingTimers = new Map<string, ReturnType<typeof setTimeout>>();
    const setTyping = (peerId: string, isTyping: boolean) => {
      clearTimeout(typingTimers.get(peerId));
      typingTimers.delete(peerId);
      queryClient.setQueryData<boolean>(
        dmTypingQueryOptions(user, peerId).queryKey,
        isTyping,
      );
      if (isTyping) {
        typingTimers.set(
          peerId,
          setTimeout(() => setTyping(peerId, false), typingTimeoutMs),
        );
      }
    };

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

    const unsubscribe = getDmTransport(user.id).subscribe((event) => {
      if (event.type === 'chatState') {
        setTyping(event.peerId, event.state === 'composing');
        return;
      }

      if (event.type === 'edit') {
        queryClient.setQueryData<DmMessage[]>(
          dmThreadQueryKey(user, event.edit.peerId),
          (messages) => messages && applyEdit(messages, event.edit),
        );
        applyEditToConversations(queryClient, user, event.edit);
        return;
      }

      // The optimistic copy is wrong; the archive has what went through.
      if (event.type === 'editRejected') {
        displayToast("Couldn't save your edit. Try again.");
        queryClient.invalidateQueries({
          queryKey: dmThreadQueryKey(user, event.peerId),
        });
        return;
      }

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

      // The archive has what actually went through, and the peer's status
      // changed, so reacting gets disabled too.
      if (event.type === 'reactionRejected') {
        displayToast(peerUnavailableCopy);
        queryClient.invalidateQueries({
          queryKey: dmThreadQueryKey(user, event.peerId),
        });
        queryClient.invalidateQueries({
          queryKey: generateQueryKey(
            RequestKey.DirectMessagePeer,
            user,
            event.peerId,
          ),
        });
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
      // Their message is what they were typing.
      if (message.senderId !== user.id) {
        setTyping(message.peerId, false);
      }
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

    return () => {
      unsubscribe();
      typingTimers.forEach((timer) => clearTimeout(timer));
    };
  }, [displayToast, enabled, queryClient, user]);
};
