import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { DmMessage } from '../../messages/types';
import { lfgConversationQueryOptions } from '../queries';
import { addLfgPitches } from '../lib/thread';
import { useLfgEnabled } from './useLfgEnabled';

export const useLfgThreadPitches = (
  peerId: string,
  requestMessage: string | null | undefined,
  messages: DmMessage[],
): DmMessage[] => {
  const { user } = useAuthContext();
  const { isEnabled } = useLfgEnabled();
  const { data } = useQuery(
    lfgConversationQueryOptions(user, peerId, { enabled: isEnabled }),
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
