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

      const reaction = {
        peerId: peer.id,
        senderId: user.id,
        messageId: message.id,
        emojis: isRemoving
          ? own.filter((value) => value !== emoji)
          : [...own, emoji],
      };
      const threadKey = dmThreadQueryKey(user, peer.id);
      const apply = (emojis: string[]) =>
        queryClient.setQueryData<DmMessage[]>(
          threadKey,
          (messages) =>
            messages && applyReaction(messages, { ...reaction, emojis }),
        );

      apply(reaction.emojis);
      getDmTransport(user.id)
        .react(peer, message.id, reaction.emojis)
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
          apply(own);
          displayToast("Couldn't save your reaction. Try again.");
        });
    },
    [displayToast, logEvent, peer, queryClient, user],
  );
};
