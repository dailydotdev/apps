import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { LogEvent } from '../../../lib/log';
import { getDmTransport } from '../transport';
import { dmThreadQueryKey } from '../queries';
import { applyReaction, getOwnReactions } from '../stanzas';
import type { DmMessage, DmPeer } from '../types';
import { DM_MAX_REACTIONS_PER_USER } from '../types';

export const useReactToMessage = (
  peer: DmPeer | null | undefined,
): ((message: DmMessage, emoji: string) => void) => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();

  return useCallback(
    (message: DmMessage, emoji: string) => {
      if (!user || !peer) {
        return;
      }

      const own = getOwnReactions(message, user.id);
      const isRemoving = own.includes(emoji);

      if (!isRemoving && own.length >= DM_MAX_REACTIONS_PER_USER) {
        displayToast(
          `You can add up to ${DM_MAX_REACTIONS_PER_USER} reactions to a message`,
        );
        return;
      }

      // Adds or removes just this emoji on the cached copy, so undoing it
      // keeps any other reaction made while this one was in flight.
      const toggle = (add: boolean): string[] => {
        const threadKey = dmThreadQueryKey(user, peer.id);
        const cached = queryClient
          .getQueryData<DmMessage[]>(threadKey)
          ?.find(({ id }) => id === message.id);
        const current = getOwnReactions(cached ?? message, user.id);
        const emojis = add
          ? Array.from(new Set([...current, emoji]))
          : current.filter((value) => value !== emoji);
        queryClient.setQueryData<DmMessage[]>(
          threadKey,
          (messages) =>
            messages &&
            applyReaction(messages, {
              peerId: peer.id,
              senderId: user.id,
              messageId: message.id,
              emojis,
            }),
        );

        return emojis;
      };

      getDmTransport(user.id)
        .react(peer, message.id, toggle(!isRemoving))
        .then(() =>
          logEvent({
            event_name: isRemoving
              ? LogEvent.RemoveDirectMessageReaction
              : LogEvent.ReactDirectMessage,
            target_id: peer.id,
            extra: JSON.stringify({ emoji }),
          }),
        )
        .catch(() => {
          toggle(isRemoving);
          displayToast("Couldn't save your reaction. Try again.");
        });
    },
    [displayToast, logEvent, peer, queryClient, user],
  );
};
