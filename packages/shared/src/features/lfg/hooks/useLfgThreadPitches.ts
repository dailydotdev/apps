import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { DmMessage } from '../../messages/types';
import { lfgConversationQueryOptions } from '../queries';
import { addLfgPitches } from '../lib/thread';
import { useLfgEnabled } from './useLfgEnabled';
import { isSupportPeerId } from '../../messages/support';

export const useLfgThreadPitches = (
  peerId: string,
  requestMessage: string | null | undefined,
  messages: DmMessage[],
): DmMessage[] => {
  const { user } = useAuthContext();
  const { isEnabled } = useLfgEnabled();
  const { data } = useQuery(
    lfgConversationQueryOptions(user, peerId, {
      // A support chat is no pair of users to have reached out.
      enabled: isEnabled && !isSupportPeerId(peerId),
    }),
  );

  if (!data?.reachOuts.length) {
    return messages;
  }

  return addLfgPitches({
    messages,
    reachOuts: data.reachOuts,
    requestMessage,
    peerId,
  });
};
