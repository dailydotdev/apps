import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { LogEvent } from '../../../lib/log';
import { getDmTransport } from '../transport';
import { patchDmMessage } from '../queries';
import type { DmMessage, DmPeer } from '../types';

export const useEditMessage = (
  peer: DmPeer | null | undefined,
): ((message: DmMessage, body: string) => void) => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();

  return useCallback(
    (message: DmMessage, body: string) => {
      if (!user || !peer || body === message.body) {
        return;
      }

      const apply = (next: Pick<DmMessage, 'body' | 'editedAt'>) =>
        patchDmMessage(queryClient, user, peer.id, message.id, (current) => ({
          ...current,
          ...next,
        }));

      apply({ body, editedAt: new Date().toISOString() });

      getDmTransport(user.id)
        .edit(peer, message.id, body)
        .then(() =>
          logEvent({
            event_name: LogEvent.EditDirectMessage,
            target_id: peer.id,
          }),
        )
        .catch(() => {
          // Never left the client, so the original is still what both sides
          // have.
          apply({ body: message.body, editedAt: message.editedAt });
          displayToast("Couldn't save your edit. Try again.");
        });
    },
    [displayToast, logEvent, peer, queryClient, user],
  );
};
